from fastapi import APIRouter, HTTPException
import uuid
from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel
from adapter.storage import StorageRepositoryImpl

router = APIRouter()
storage_repository = StorageRepositoryImpl()

class CreateSessionRequest(BaseModel):
    user_id: str | None = None
    metadata: Dict[str, Any] = {}

class CreateSessionResponse(BaseModel):
    session_id: str
    created_at: datetime
    status: str

class SessionInfo(BaseModel):
    session_id: str
    created_at: datetime
    message_count: int
    last_activity: datetime

@router.post("/sessions", response_model=CreateSessionResponse)
async def create_session(request: CreateSessionRequest):
    """Create a new chat session"""
    try:
        # Generate a unique session ID
        session_id = str(uuid.uuid4())
        
        # Initialize the session in the database
        await storage_repository.init_session(session_id)
        
        return CreateSessionResponse(
            session_id=session_id,
            created_at=datetime.utcnow(),
            status="created"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@router.get("/sessions/{session_id}", response_model=SessionInfo)
async def get_session_info(session_id: str):
    """Get information about a specific session"""
    try:
        session_info = await storage_repository.get_session_info(session_id)
        if not session_info:
            raise HTTPException(status_code=404, detail="Session not found")
        return session_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session info: {str(e)}")

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and all its associated data"""
    try:
        success = await storage_repository.delete_session(session_id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")

@router.get("/sessions")
async def list_sessions():
    """List all sessions"""
    try:
        sessions = await storage_repository.list_sessions()
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}") 