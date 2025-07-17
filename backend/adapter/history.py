import json
import os
from typing import Any
import aiofiles

class HistoryRepositoryImpl:
    def __init__(self):
        self.history_path = "team_history.json"
        self.history = []

    async def load_history(self) -> list[dict[str, Any]]:
        if not os.path.exists(self.history_path):
            return []
        async with aiofiles.open(self.history_path, "r") as file:
            s = await file.read()
            if s == "":
                return []
            self.history = json.loads(s)
            return self.history
        
    async def save_history(self, history: list[dict[str, Any]]):
        self.history = history
        async with aiofiles.open(self.history_path, "w") as file:
            await file.write(json.dumps(history, default=str))
    
    async def get_history(self) -> list[dict[str, Any]]:
        if len(self.history) == 0:
            await self.load_history()
        return self.history
    
    async def append_history(self, message: dict[str, Any]):
        self.history.append(message)
