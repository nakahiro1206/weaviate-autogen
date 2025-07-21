from typing import Any, Awaitable, Callable, Optional
# https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/agents.html#streaming-tokens

from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from autogen_core.tools import FunctionTool
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_core import CancellationToken
from autogen_core.models import ChatCompletionClient
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from lib.model_config import load_model_config
from lib.tools.sample import sample_tool
from lib.tools.weaviate_tools import search_paper, search_chunk

class TeamRepositoryImpl:
    def __init__(self):
        self.model_client = None
        self.team = None
    
    async def load_model_config(self) -> Any:
        model_config = await load_model_config()
        self.model_client = ChatCompletionClient.load_component(model_config)

    async def get_team(
        self, 
        user_input_func: Callable[[str, Optional[CancellationToken]], Awaitable[str]],
        state: Any | None = None
    ) -> RoundRobinGroupChat:
        if self.model_client is None:
            raise ValueError("Model client not loaded")
        
        search_paper_agent = AssistantAgent(
            name="search_paper_agent",
            model_client=self.model_client,
            # TODO: these tools are called at the same time,
            # so need to change impl as search_paper -> search_chunk -> summarize
            description="Search for paper related to the query from database",
            tools=[
                FunctionTool(
                    name="search_paper",
                    description="Search for paper related to the query from database",
                    func=search_paper,
                )
            ],
            system_message="search for the paper related to the query. Make sure to respond with the paper id(uuid)",
            max_tool_iterations=10,  # At most 10 iterations of tool calls before stopping the loop.
        )

        search_chunk_agent = AssistantAgent(
            name="search_chunk_agent",
            model_client=self.model_client,
            description="Search for chunk related to the query from the paper with the given id",
            tools=[
                FunctionTool(
                    name="search_chunk",
                    description="Search for chunk related to the query from the paper with the given id",
                    func=search_chunk,
                )
            ],
            system_message="search for the paper first, then search for the chunk related to the query from the paper",
            max_tool_iterations=10,
        )

        summarize_agent = AssistantAgent(
            name="summarize_agent",
            model_client=self.model_client,
            description="Summarize the paper",
            system_message="Summarize the given information and generate TL;DR. Use bullet points to organize the structure",
            max_tool_iterations=10,
        )

        user_proxy = UserProxyAgent(
            name="user_proxy",
            description="User proxy",
            input_func=user_input_func
        )

        # TODO: implement explicit termination flag
        # The termination condition is a combination of text termination and max message termination, either of which will cause the chat to terminate.
        termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(10)
        self.team = RoundRobinGroupChat([
            search_paper_agent,
            search_chunk_agent,
            summarize_agent,
            user_proxy
        ], termination_condition=termination)
        if state is not None:
            await self.team.load_state(state)
        return self.team

    async def save_team(self, team: RoundRobinGroupChat):
        self.team = team
        return await self.team.save_state()