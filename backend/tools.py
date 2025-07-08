import aiofiles
import yaml
import asyncio
from autogen_core.models import ChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_core.tools import FunctionTool
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
import os
from dotenv import load_dotenv
import weaviate
from weaviate.classes.query import MetadataQuery

load_dotenv()

openai_api_key = os.environ["OPENAI_API_KEY"]

# Define a tool using a Python function.
async def web_search_func(query: str) -> str:
    """Find information on the web"""
    return "AutoGen is a programming framework for building multi-agent applications."

async def search_papaer_func(query: str) -> str:
    client = weaviate.connect_to_local(
        host="localhost",  # Use a string to specify the host
        port=8080,
        grpc_port=50051,
        headers={"X-OpenAI-Api-Key": openai_api_key},
    )

    print(client.is_ready())

    paper_collection = client.collections.get("Paper")

    result = paper_collection.query.near_text(
        query=query,
        limit=10,
        return_metadata=MetadataQuery(distance=True)
    )

    client.close()

    # for o in result.objects:
    #     print(o.properties["info"]["title"])
    #     print(o.metadata.distance)
    if len(result.objects) == 0:
        return "No paper found"
    else:
        summary = result.objects[0].properties["summary"]
        title = result.objects[0].properties["info"]["title"]
        return f"{title}\n{summary}"

    
# This step is automatically performed inside the AssistantAgent if the tool is a Python function.
# web_search_function_tool = FunctionTool(web_search_func, description="Find information on the web")

async def main():
    # Get model client from config.
    async with aiofiles.open("model_config.yaml", "r") as file:
        model_config = yaml.safe_load(await file.read())
    model_client = ChatCompletionClient.load_component(model_config)

    agent_with_tools = AssistantAgent(
        name="assistant_loop",
        model_client=model_client,
        tools=[
            web_search_func,
            search_papaer_func,
        ],
        system_message="Use tools to solve tasks. Reply only 'TERMINATE' if the task is done.",
        max_tool_iterations=10,  # At most 10 iterations of tool calls before stopping the loop.
    )

    # The termination condition is a combination of text termination and max message termination, either of which will cause the chat to terminate.
    termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(10)

    # The group chat will alternate between the assistant and the code executor.
    group_chat = RoundRobinGroupChat([agent_with_tools], termination_condition=termination)
    
    # `run_stream` returns an async generator to stream the intermediate messages.
    stream = group_chat.run_stream(task="Search for paper on machine learning. And summarize into several sentences.")
    # `Console` is a simple UI to display the stream.
    await Console(stream)

    # Close the connection to the model client.
    await model_client.close()

if __name__ == "__main__":
    asyncio.run(main())