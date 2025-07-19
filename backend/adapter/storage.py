from lib.sqlalchemy.db import SessionLocal
from lib.sqlalchemy.sqlalchemy_models import WebsocketMessage as WebsocketMessageDb, WebsocketSession as WebsocketSessionDb
from models.websocket import WebsocketMessage as WebsocketMessageDomain
from typing import Any 

# operates sqlalchemy
class StorageRepositoryImpl:
    def __init__(self):
        self.session = SessionLocal()

    async def load_history(self, session_id: str) -> list[WebsocketMessageDomain]:
        # First get the session record
        session = self.session.query(WebsocketSessionDb).filter(WebsocketSessionDb.session_id == session_id).first()
        if not session:
            return []
        
        # Then get messages for this session
        result = self.session.query(WebsocketMessageDb).filter(WebsocketMessageDb.session_id == session.id).all()
        return list(map(lambda x: WebsocketMessageDomain.model_validate({
            "id": x.id,
            "session_id": x.session_id,
            "message": x.message,
            "created_at": x.created_at
        }), result))
    
    async def save_history(self, session_id: str, history: list[WebsocketMessageDomain]):
        # First get the session record
        session = self.session.query(WebsocketSessionDb).filter(WebsocketSessionDb.session_id == session_id).first()
        if not session:
            return
        
        # Delete existing messages for this session
        self.session.query(WebsocketMessageDb).filter(WebsocketMessageDb.session_id == session.id).delete()
        
        # Add new messages
        self.session.add_all(list(map(lambda x: WebsocketMessageDb(
            id=x.id,
            session_id=session.id,  # Use session.id, not session_id string
            message=x.message,
            created_at=x.created_at
        ), history)))
        self.session.commit()
    
    async def save_llm_state(self, session_id: str, llm_state: Any):
        self.session.query(WebsocketSessionDb).filter(WebsocketSessionDb.session_id == session_id).update({
            "llm_state": llm_state
        })
        self.session.commit()
    
    async def load_llm_state(self, session_id: str) -> Any | None:
        result = self.session.query(WebsocketSessionDb).filter(WebsocketSessionDb.session_id == session_id).first()
        if not result:
            return None
        return result.llm_state
    
    async def save_message(self, session_id: str, message: str):
        """Save a single message to the session"""
        session = self.session.query(WebsocketSessionDb).filter(WebsocketSessionDb.session_id == session_id).first()
        if not session:
            return
        
        message_db = WebsocketMessageDb(
            session_id=session.id,
            message=message
        )
        self.session.add(message_db)
        self.session.commit()

    async def init_session(self, session_id: str):
        self.session.add(WebsocketSessionDb(
            session_id=session_id,
            llm_state=None
        ))
        self.session.commit()
    
    async def get_session_info(self, session_id: str) -> dict | None:
        """Get session information including message count and last activity"""
        session = self.session.query(WebsocketSessionDb).filter(WebsocketSessionDb.session_id == session_id).first()
        if not session:
            return None
        
        # Get message count for this session
        message_count = self.session.query(WebsocketMessageDb).filter(WebsocketMessageDb.session_id == session.id).count()
        
        # Get last activity (latest message timestamp)
        latest_message = self.session.query(WebsocketMessageDb).filter(WebsocketMessageDb.session_id == session.id).order_by(WebsocketMessageDb.created_at.desc()).first()
        last_activity = latest_message.created_at if latest_message else session.created_at
        
        return {
            "session_id": session.session_id,
            "created_at": session.created_at,
            "message_count": message_count,
            "last_activity": last_activity
        }
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete a session and all its messages"""
        session = self.session.query(WebsocketSessionDb).filter(WebsocketSessionDb.session_id == session_id).first()
        if not session:
            return False
        
        # Delete all messages for this session
        self.session.query(WebsocketMessageDb).filter(WebsocketMessageDb.session_id == session.id).delete()
        
        # Delete the session
        self.session.delete(session)
        self.session.commit()
        return True
    
    async def list_sessions(self) -> list[dict]:
        """List all sessions with basic information"""
        sessions = self.session.query(WebsocketSessionDb).all()
        result = []
        
        for session in sessions:
            # Get message count for this session
            message_count = self.session.query(WebsocketMessageDb).filter(WebsocketMessageDb.session_id == session.id).count()
            
            # Get last activity
            latest_message = self.session.query(WebsocketMessageDb).filter(WebsocketMessageDb.session_id == session.id).order_by(WebsocketMessageDb.created_at.desc()).first()
            last_activity = latest_message.created_at if latest_message else session.created_at
            
            result.append({
                "session_id": session.session_id,
                "created_at": session.created_at,
                "message_count": message_count,
                "last_activity": last_activity
            })
        
        return result