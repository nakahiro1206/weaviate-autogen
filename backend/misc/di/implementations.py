import json
import os
import aiofiles
import yaml
from typing import Any, Awaitable, Callable, Optional, List, Dict
from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from autogen_core.tools import FunctionTool
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_core import CancellationToken
from autogen_core.models import ChatCompletionClient
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from fastapi import WebSocket

from .interfaces import (
    IModelClientProvider, 
    ITeamRepository, 
    IHistoryRepository, 
    IConfigurationProvider,
    IWebSocketHandler
)
from lib.tools.sample import sample_tool

class ModelClientProvider(IModelClientProvider):
    """Concrete implementation of model client provider"""
    
    def __init__(self, config_provider: IConfigurationProvider):
        self.config_provider = config_provider
        self._model_client: Optional[ChatCompletionClient] = None
    
    async def get_model_client(self) -> ChatCompletionClient:
        if self._model_client is None:
            model_config = await self.config_provider.get_model_config()
            self._model_client = ChatCompletionClient.load_component(model_config)
        return self._model_client
    
    async def close(self) -> None:
        if self._model_client:
            await self._model_client.close()
            self._model_client = None

class TeamRepository(ITeamRepository):
    """Concrete implementation of team repository"""
    
    def __init__(self, model_client_provider: IModelClientProvider, config_provider: IConfigurationProvider):
        self.model_client_provider = model_client_provider
        self.config_provider = config_provider
        self._team: Optional[RoundRobinGroupChat] = None
    
    async def get_team(
        self, 
        user_input_func: Callable[[str, Optional[CancellationToken]], Awaitable[str]],
        state: Any | None = None
    ) -> RoundRobinGroupChat:
        model_client = await self.model_client_provider.get_model_client()
        
        agent = AssistantAgent(
            name="assistant",
            model_client=model_client,
            system_message="You are a helpful assistant.",
            tools=[
                FunctionTool(
                    name="sample_tool",
                    description="web search tool",
                    func=sample_tool,
                )
            ],
        )
        veldemort = AssistantAgent(
            name="veldemort",
            model_client=model_client,
            system_message="Repeat the same message in the tone of Veldemort.",
        )
        user_proxy = UserProxyAgent(name="user", input_func=user_input_func)
        
        termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(10)
        self._team = RoundRobinGroupChat([agent, veldemort, user_proxy], termination_condition=termination)
        
        if state is not None:
            await self.load_team_state(self._team, state)
        
        return self._team
    
    async def save_team_state(self, team: RoundRobinGroupChat) -> Dict[str, Any]:
        return await team.save_state()
    
    async def load_team_state(self, team: RoundRobinGroupChat, state: Dict[str, Any]) -> None:
        await team.load_state(state)

class HistoryRepository(IHistoryRepository):
    """Concrete implementation of history repository"""
    
    def __init__(self, config_provider: IConfigurationProvider):
        self.config_provider = config_provider
        self._history: Optional[List[Dict[str, Any]]] = None
    
    async def load_history(self) -> List[Dict[str, Any]]:
        history_path = await self.config_provider.get_history_path()
        if not os.path.exists(history_path):
            return []
        
        async with aiofiles.open(history_path, "r") as file:
            content = await file.read()
            if content == "":
                return []
            self._history = json.loads(content)
            return self._history
    
    async def save_history(self, history: List[Dict[str, Any]]) -> None:
        self._history = history
        history_path = await self.config_provider.get_history_path()
        async with aiofiles.open(history_path, "w") as file:
            await file.write(json.dumps(history, default=str))
    
    async def append_message(self, message: Dict[str, Any]) -> None:
        if self._history is None:
            self._history = []
        self._history.append(message)
    
    async def get_history(self) -> List[Dict[str, Any]] | None:
        return self._history if self._history is not None else []

class ConfigurationProvider(IConfigurationProvider):
    """Concrete implementation of configuration provider"""
    
    def __init__(self, model_config_path: str = "model_config.yaml", 
                 state_path: str = "team_state.json", 
                 history_path: str = "team_history.json"):
        self.model_config_path = model_config_path
        self.state_path = state_path
        self.history_path = history_path
        self._model_config: Optional[Dict[str, Any]] = None
    
    async def get_model_config(self) -> Dict[str, Any]:
        if self._model_config is None:
            async with aiofiles.open(self.model_config_path, "r") as file:
                config = yaml.safe_load(await file.read())
                self._model_config = dict(config) if config else {}
        return self._model_config
    
    async def get_state_path(self) -> str:
        return self.state_path
    
    async def get_history_path(self) -> str:
        return self.history_path

class WebSocketHandler(IWebSocketHandler):
    """Concrete implementation of WebSocket handler"""
    
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
    
    async def handle_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        # This would contain the logic for handling incoming messages
        # For now, just return the message as-is
        return message
    
    async def send_message(self, message: Dict[str, Any]) -> None:
        await self.websocket.send_json(message) 