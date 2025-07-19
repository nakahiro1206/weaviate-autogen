from fastapi import APIRouter, Query
from adapter.history import HistoryRepositoryImpl
from adapter.session_history import SessionHistoryRepositoryImpl
from adapter.storage import StorageRepositoryImpl
from typing import Any

router = APIRouter()

history_repository = HistoryRepositoryImpl()
storage_repository = StorageRepositoryImpl()

@router.get("/history")
async def history(session_id: str = Query(None, description="Session ID for specific session history")) -> list[dict[str, Any]]:
    """Get history - either global or session-specific"""
    if session_id:
        # Get session-specific history
        session_history_repository = SessionHistoryRepositoryImpl(session_id)
        return await session_history_repository.get_history()
    else:
        # Get global history (backward compatibility)
        return await history_repository.get_history()

@router.get("/sessions/{session_id}/history")
async def session_history(session_id: str) -> list[dict[str, Any]]:
    """Get history for a specific session"""
    session_history_repository = SessionHistoryRepositoryImpl(session_id)
    return await session_history_repository.get_history()