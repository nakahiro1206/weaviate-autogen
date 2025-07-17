from abc import ABC, abstractmethod
from typing import Any, Awaitable, Callable, Optional, List, Dict
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_core import CancellationToken
from autogen_core.models import ChatCompletionClient

class IModelClientProvider(ABC):
    """Interface for providing model clients"""
    
    @abstractmethod
    async def get_model_client(self) -> ChatCompletionClient:
        """Get a configured model client"""
        pass
    
    @abstractmethod
    async def close(self) -> None:
        """Close the model client"""
        pass

class ITeamRepository(ABC):
    """Interface for team management"""
    
    @abstractmethod
    async def get_team(
        self, 
        user_input_func: Callable[[str, Optional[CancellationToken]], Awaitable[str]],
        state: Any | None = None
    ) -> RoundRobinGroupChat:
        """Get or create a team with the given user input function"""
        pass
    
    @abstractmethod
    async def save_team_state(self, team: RoundRobinGroupChat) -> Dict[str, Any]:
        """Save the current state of a team"""
        pass
    
    @abstractmethod
    async def load_team_state(self, team: RoundRobinGroupChat, state: Dict[str, Any]) -> None:
        """Load state into a team"""
        pass

class IHistoryRepository(ABC):
    """Interface for conversation history management"""
    
    @abstractmethod
    async def load_history(self) -> List[Dict[str, Any]]:
        """Load conversation history"""
        pass
    
    @abstractmethod
    async def save_history(self, history: List[Dict[str, Any]]) -> None:
        """Save conversation history"""
        pass
    
    @abstractmethod
    async def append_message(self, message: Dict[str, Any]) -> None:
        """Append a message to the history"""
        pass
    
    @abstractmethod
    async def get_history(self) -> List[Dict[str, Any]]:
        """Get the current history"""
        pass

class IConfigurationProvider(ABC):
    """Interface for configuration management"""
    
    @abstractmethod
    async def get_model_config(self) -> Dict[str, Any]:
        """Get model configuration"""
        pass
    
    @abstractmethod
    async def get_state_path(self) -> str:
        """Get the path for team state storage"""
        pass
    
    @abstractmethod
    async def get_history_path(self) -> str:
        """Get the path for history storage"""
        pass

class IWebSocketHandler(ABC):
    """Interface for WebSocket message handling"""
    
    @abstractmethod
    async def handle_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming WebSocket message"""
        pass
    
    @abstractmethod
    async def send_message(self, message: Dict[str, Any]) -> None:
        """Send message through WebSocket"""
        pass 