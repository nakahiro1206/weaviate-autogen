import json
import os
import aiofiles
from typing import Any

class TeamStateRepositoryImpl:
    def __init__(self):
        self.team_state_path = "team_state.json"
        self.team_state = None

    async def load_team_state(self) -> dict[str, Any]:
        if not os.path.exists(self.team_state_path):
            return {}
        async with aiofiles.open(self.team_state_path, "r") as file:
            s = await file.read()
            if s == "":
                return {}
            self.team_state = json.loads(s)
            return self.team_state
    
    async def save_team_state(self, team_state: Any):
        self.team_state = team_state
        async with aiofiles.open(self.team_state_path, "w") as file:
            await file.write(json.dumps(team_state, default=str))
    
    async def get_team_state(self) -> dict[str, Any] | None:
        return self.team_state
    
    async def update_team_state(self, state: Any):
        self.team_state = state
