import json
import logging
import os
import asyncio
from typing import Any, Awaitable, Callable, Optional

import aiofiles
import yaml
from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from autogen_agentchat.base import TaskResult
from autogen_agentchat.messages import TextMessage, UserInputRequestedEvent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_core import CancellationToken
from autogen_core.models import ChatCompletionClient
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_config_path = "model_config.yaml"
state_path = "team_state.json"
history_path = "team_history.json"

app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/")
async def root():
    return FileResponse("ws_example/app_team.html")

async def get_team(user_input_func: Callable[[str, Optional[CancellationToken]], Awaitable[str]]) -> RoundRobinGroupChat:
    async with aiofiles.open(model_config_path, "r") as file:
        model_config = yaml.safe_load(await file.read())
    model_client = ChatCompletionClient.load_component(model_config)
    agent = AssistantAgent(
        name="assistant",
        model_client=model_client,
        system_message="You are a helpful assistant.",
    )
    yoda = AssistantAgent(
        name="yoda",
        model_client=model_client,
        system_message="Repeat the same message in the tone of Yoda.",
    )
    user_proxy = UserProxyAgent(name="user", input_func=user_input_func)
    team = RoundRobinGroupChat([agent, yoda, user_proxy])
    if not os.path.exists(state_path):
        return team
    async with aiofiles.open(state_path, "r") as file:
        state = json.loads(await file.read())
    await team.load_state(state)
    return team

async def get_history() -> list[dict[str, Any]]:
    if not os.path.exists(history_path):
        return []
    async with aiofiles.open(history_path, "r") as file:
        return json.loads(await file.read())

@app.get("/history")
async def history():
    try:
        return await get_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@app.websocket("/ws/chat")
async def chat(websocket: WebSocket):
    await websocket.accept()

    message_queue = asyncio.Queue()
    user_input_event = asyncio.Event()
    user_input_response = {}

    async def receive_loop():
        try:
            while True:
                data = await websocket.receive_json()
                await message_queue.put(data)
        except WebSocketDisconnect:
            logger.info("Client disconnected in receive loop")

    receive_task = asyncio.create_task(receive_loop())

    async def _user_input(prompt: str, cancellation_token: Optional[CancellationToken]) -> str:
        user_input_event.clear()
        await websocket.send_json({
            "type": "UserInputRequestedEvent",
            "content": prompt,
            "source": "system"
        })
        await user_input_event.wait()
        return user_input_response["content"]

    try:
        while True:
            data = await message_queue.get()
            request = TextMessage.model_validate(data)

            # If this is a user response to input prompt
            if user_input_event.is_set() is False and "type" in data and data["type"] != "TextMessage":
                user_input_response["content"] = data["content"]
                user_input_event.set()
                continue

            try:
                team = await get_team(_user_input)
                history = await get_history()
                stream = team.run_stream(task=request)
                async for message in stream:
                    if isinstance(message, TaskResult):
                        continue
                    await websocket.send_json(message.model_dump(mode="json"))
                    if not isinstance(message, UserInputRequestedEvent):
                        history.append(message.model_dump(mode="json"))

                async with aiofiles.open(state_path, "w") as file:
                    state = await team.save_state()
                    await file.write(json.dumps(state, default=str))

                async with aiofiles.open(history_path, "w") as file:
                    await file.write(json.dumps(history, default=str))

            except WebSocketDisconnect:
                logger.info("Client disconnected during message processing")
                break
            except Exception as e:
                error_message = {
                    "type": "error",
                    "content": f"Error: {str(e)}",
                    "source": "system"
                }
                try:
                    await websocket.send_json(error_message)
                    await websocket.send_json({
                        "type": "UserInputRequestedEvent",
                        "content": "An error occurred. Please try again.",
                        "source": "system"
                    })
                except WebSocketDisconnect:
                    logger.info("Client disconnected while sending error message")
                    break
                except Exception as send_error:
                    logger.error(f"Failed to send error message: {str(send_error)}")
                    break

    except WebSocketDisconnect:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        try:
            await websocket.send_json({
                "type": "error",
                "content": f"Unexpected error: {str(e)}",
                "source": "system"
            })
        except Exception:
            logger.error("Failed to send error message to client")

# Example usage
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
