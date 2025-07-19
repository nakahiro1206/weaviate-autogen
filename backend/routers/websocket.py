from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import logging
import json
from typing import Any

import aiofiles
from autogen_agentchat.base import TaskResult
from autogen_agentchat.messages import TextMessage, UserInputRequestedEvent
from autogen_core import CancellationToken
from adapter.history import HistoryRepositoryImpl
from adapter.team_state import TeamStateRepositoryImpl
from adapter.team import TeamRepositoryImpl
from adapter.storage import StorageRepositoryImpl
from adapter.session_history import SessionHistoryRepositoryImpl
from adapter.session_team_state import SessionTeamStateRepositoryImpl

logger = logging.getLogger(__name__)

router = APIRouter()

# Global repositories (for backward compatibility)
history_repository = HistoryRepositoryImpl()
team_state_repository = TeamStateRepositoryImpl()
team_repository = TeamRepositoryImpl()
storage_repository = StorageRepositoryImpl()

@router.websocket("/ws/chat")
async def chat(websocket: WebSocket, session_id: str = Query(..., description="Session ID for the chat")):
    await websocket.accept()
    
    # Validate session exists or create new one
    session_info = await storage_repository.get_session_info(session_id)
    if not session_info:
        # Create new session if it doesn't exist
        await storage_repository.init_session(session_id)
        logger.info(f"Created new session: {session_id}")
    else:
        logger.info(f"Using existing session: {session_id}")

    # Create session-specific repositories
    session_history_repository = SessionHistoryRepositoryImpl(session_id)
    session_team_state_repository = SessionTeamStateRepositoryImpl(session_id)

    # User input function used by the team.
    # this function is called from 2nd round of the team chat
    async def _user_input(prompt: str, cancellation_token: CancellationToken | None) -> str:
        try:
            data = await websocket.receive_json()
            print("_user_input: data", data)
            message = TextMessage.model_validate(data)
            print("_user_input: message", message)
            return message.content
        except WebSocketDisconnect:
            # Client disconnected while waiting for input - this is the root cause of the issue
            logger.info("Client disconnected while waiting for user input")
            raise  # Let WebSocketDisconnect propagate to be handled by outer try/except

    try:
        while True:
            # Get user message.
            print("waiting for message")
            # get the initial message from the client
            # TODO: issue session id.
            initial_data = await websocket.receive_json()
            initial_request = TextMessage.model_validate(initial_data)
            print("initial_request", initial_request)
            print("initial_data", initial_data)

            try:
                await team_repository.load_model_config()
                team_state = await session_team_state_repository.get_team_state()
                history = await session_history_repository.get_history()
                
                team = await team_repository.get_team(_user_input, team_state)
                stream = team.run_stream(task=initial_request)
                async for message in stream:
                    if isinstance(message, TaskResult):
                        print("TaskResult", message)
                        continue
                    await websocket.send_json(message.model_dump(mode="json"))
                    if not isinstance(message, UserInputRequestedEvent):
                        history.append(message.model_dump(mode="json"))

                team_state = await team.save_state()
                await session_team_state_repository.save_team_state(team_state)
                await session_history_repository.save_history(history)

            except WebSocketDisconnect:
                logger.info("Client disconnected during message processing")
                break
            except Exception as e:
                print("error", e)
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