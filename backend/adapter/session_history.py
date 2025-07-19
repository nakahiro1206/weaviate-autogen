from typing import Any, List
from adapter.storage import StorageRepositoryImpl
from models.websocket import WebsocketMessage as WebsocketMessageDomain

class SessionHistoryRepositoryImpl:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.storage_repository = StorageRepositoryImpl()

    async def load_history(self) -> List[dict[str, Any]]:
        """Load history for the current session"""
        messages = await self.storage_repository.load_history(self.session_id)
        return [message.model_dump() for message in messages]
    
    async def save_history(self, history: List[dict[str, Any]]):
        """Save history for the current session"""
        # Convert dict messages to domain models
        domain_messages = []
        for msg_dict in history:
            # Create a temporary ID if not present
            if 'id' not in msg_dict:
                msg_dict['id'] = len(domain_messages) + 1
            domain_messages.append(WebsocketMessageDomain.model_validate(msg_dict))
        
        await self.storage_repository.save_history(self.session_id, domain_messages)
    
    async def get_history(self) -> List[dict[str, Any]]:
        """Get history for the current session"""
        return await self.load_history()
    
    async def append_history(self, message: dict[str, Any]):
        """Append a message to the current session history"""
        # Save the message to the database
        await self.storage_repository.save_message(self.session_id, str(message))
        
        # Also update the in-memory history
        current_history = await self.get_history()
        current_history.append(message)
        await self.save_history(current_history) 