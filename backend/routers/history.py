from fastapi import APIRouter
from adapter.history import HistoryRepositoryImpl
from typing import Any

router = APIRouter()

history_repository = HistoryRepositoryImpl()

@router.get("/history")
async def history() -> list[dict[str, Any]]:
    return await history_repository.get_history()