from typing import Any
from adapter.storage import StorageRepositoryImpl

class SessionTeamStateRepositoryImpl:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.storage_repository = StorageRepositoryImpl()

    async def load_team_state(self) -> dict[str, Any] | None:
        """Load team state for the current session"""
        return await self.storage_repository.load_llm_state(self.session_id)
    
    async def save_team_state(self, team_state: Any):
        """Save team state for the current session"""
        await self.storage_repository.save_llm_state(self.session_id, team_state)
    
    async def get_team_state(self) -> dict[str, Any] | None:
        """Get team state for the current session"""
        return await self.load_team_state()
    
    async def update_team_state(self, state: Any):
        """Update team state for the current session"""
        await self.save_team_state(state) 


#TODO: "Error: (builtins.TypeError) Object of type datetime is not JSON serializable [SQL: UPDATE websocket_sessions SET updated_at=now(), llm_state=%(llm_state)s::JSON WHERE websocket_sessions.session_id = %(session_id_1)s] [parameters: [{}]]"