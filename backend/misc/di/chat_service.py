import logging
from typing import Any, Awaitable, Callable, Optional, Dict
from autogen_agentchat.base import TaskResult
from autogen_agentchat.messages import TextMessage, UserInputRequestedEvent
from autogen_core import CancellationToken
from fastapi import WebSocket, WebSocketDisconnect

from .interfaces import ITeamRepository, IHistoryRepository, IWebSocketHandler

logger = logging.getLogger(__name__)

class ChatService:
    """Service for handling chat functionality with dependency injection"""
    
    def __init__(self, team_repository: ITeamRepository, history_repository: IHistoryRepository):
        self.team_repository = team_repository
        self.history_repository = history_repository
    
    async def handle_chat_session(self, websocket: WebSocket) -> None:
        """Handle a complete chat session"""
        await websocket.accept()
        
        # Create WebSocket handler
        ws_handler = WebSocketHandler(websocket)
        
        # User input function used by the team
        async def _user_input(prompt: str, cancellation_token: CancellationToken | None) -> str:
            try:
                data = await websocket.receive_json()
                logger.debug(f"_user_input: data {data}")
                message = TextMessage.model_validate(data)
                logger.debug(f"_user_input: message {message}")
                return message.content
            except WebSocketDisconnect:
                logger.info("Client disconnected while waiting for user input")
                raise
        
        try:
            while True:
                logger.info("Waiting for message")
                
                # Get the initial message from the client
                initial_data = await websocket.receive_json()
                initial_request = TextMessage.model_validate(initial_data)
                logger.info(f"Initial request: {initial_request}")
                
                try:
                    # Load history
                    history = await self.history_repository.load_history()
                    
                    # Get or create team
                    team = await self.team_repository.get_team(_user_input)
                    
                    # Run the team stream
                    stream = team.run_stream(task=initial_request)
                    async for message in stream:
                        if isinstance(message, TaskResult):
                            logger.debug(f"TaskResult: {message}")
                            continue
                        
                        await ws_handler.send_message(message.model_dump(mode="json"))
                        
                        if not isinstance(message, UserInputRequestedEvent):
                            await self.history_repository.append_message(message.model_dump(mode="json"))
                    
                    # Save team state
                    state = await self.team_repository.save_team_state(team)
                    # Note: In a real implementation, you'd save this state somewhere
                    logger.info("Team state saved")
                    
                    # Save history
                    current_history = await self.history_repository.get_history()
                    if current_history:
                        await self.history_repository.save_history(current_history)
                    
                except WebSocketDisconnect:
                    logger.info("Client disconnected during message processing")
                    break
                except Exception as e:
                    logger.error(f"Error during message processing: {e}")
                    error_message = {
                        "type": "error",
                        "content": f"Error: {str(e)}",
                        "source": "system"
                    }
                    try:
                        await ws_handler.send_message(error_message)
                        await ws_handler.send_message({
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
                await ws_handler.send_message({
                    "type": "error",
                    "content": f"Unexpected error: {str(e)}",
                    "source": "system"
                })
            except Exception:
                logger.error("Failed to send error message to client")

class WebSocketHandler(IWebSocketHandler):
    """WebSocket handler implementation"""
    
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
    
    async def handle_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        return message
    
    async def send_message(self, message: Dict[str, Any]) -> None:
        await self.websocket.send_json(message) 