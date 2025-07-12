import aiofiles
from result import is_ok
import yaml
import asyncio
from autogen_core.models import ChatCompletionClient
from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from autogen_core.tools import FunctionTool
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from typing import List
from tools.weaviate_tools import search_paper, search_chunk

async def main():
    # Get model client from config.
    async with aiofiles.open("model_config.yaml", "r") as file:
        model_config = yaml.safe_load(await file.read())
    model_client = ChatCompletionClient.load_component(model_config)

    search_paper_agent = AssistantAgent(
        name="search_paper_agent",
        model_client=model_client,
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
        system_message="search for the paper first, then search for the chunk related to the query from the paper. make sure to respond with the paper id(uuid)",
        max_tool_iterations=10,  # At most 10 iterations of tool calls before stopping the loop.
    )

    search_chunk_agent = AssistantAgent(
        name="search_chunk_agent",
        model_client=model_client,
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
        model_client=model_client,
        description="Summarize the paper",
        system_message="Summarize the given information and generate TL;DR. Use bullet points to organize the structure",
        max_tool_iterations=10,
    )

    user_proxy = UserProxyAgent(
        name="user_proxy",
        description="User proxy",
        input_func=input,
    )

    # TODO: implement explicit termination flag
    # The termination condition is a combination of text termination and max message termination, either of which will cause the chat to terminate.
    termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(10)

    # The group chat will alternate between the assistant and the code executor.
    group_chat = RoundRobinGroupChat([search_paper_agent, search_chunk_agent, summarize_agent, user_proxy], termination_condition=termination)
    
    # `run_stream` returns an async generator to stream the intermediate messages.
    stream = group_chat.run_stream(task=input("Enter your initial query: "))
    # `Console` is a simple UI to display the stream.
    await Console(stream)

    # Close the connection to the model client.
    await model_client.close()

if __name__ == "__main__":
    asyncio.run(main())