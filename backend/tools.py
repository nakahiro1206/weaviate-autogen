import aiofiles
from result import is_ok
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
from weaviate.classes.query import MetadataQuery, Filter
from model_paper import RetrievedPaperEntry, RetrievedPaperChunk, paper_entry_adapter, paper_chunk_adapter
from typing import List, Tuple
from models.paper import validate_paper_entry
from models.chunk import validate_paper_chunk

load_dotenv()

openai_api_key = os.environ["OPENAI_API_KEY"]

# Define a tool using a Python function.
async def web_search_func(query: str) -> str:
    """Find information on the web"""
    return "AutoGen is a programming framework for building multi-agent applications."

async def search_papaer_func(query: str) -> Tuple[List[RetrievedPaperEntry], str]:
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

    if len(result.objects) == 0:
        return [], "No paper found"
    else:
        retrieved_paper_entries = []
        for o in result.objects:
            r = validate_paper_entry({
            **o.properties,
            "metadata": {
                "uuid": o.uuid.hex,
                "distance": o.metadata.distance
            }})
            if is_ok(r):
                retrieved_paper_entries.append(r.unwrap().to_ai_readable())
            else:
                print(f"Invalid paper entry: {r.unwrap_err()}")
        return retrieved_paper_entries, "Paper found"

search_paper_tool = FunctionTool(search_papaer_func, description="Search for paper related to the query from database")

async def search_chunk_func(uuid: str, query: str) -> Tuple[List[RetrievedPaperChunk], str]:
    client = weaviate.connect_to_local(
        host="localhost",  # Use a string to specify the host
        port=8080,
        grpc_port=50051,
        headers={"X-OpenAI-Api-Key": openai_api_key},
    )

    if not client.is_ready():
        return [], "Weaviate is not ready"
    
    # ensure the paper exists
    paper_collection = client.collections.get("Paper")
    result = paper_collection.query.fetch_object_by_id(uuid)
    if result is None:
        return [], "Paper not found"

    chunk_collection = client.collections.get("PaperChunk")

    result = chunk_collection.query.near_text(
        filters=Filter.by_property("paperId").equal(uuid),
        query=query,
        limit=10,
        return_metadata=MetadataQuery(distance=True)
    )

    client.close()

    if len(result.objects) == 0:
        return [], "No chunk found"
    else:
        retrieved_paper_chunks = []
        for o in result.objects:
            r = validate_paper_chunk({
            **o.properties,
            "metadata": {
                "uuid": o.uuid.hex,
                "distance": o.metadata.distance
            }})
            if is_ok(r):
                retrieved_paper_chunks.append(r.unwrap().to_ai_readable())
            else:
                print(f"Invalid paper chunk: {r.unwrap_err()}")
        return retrieved_paper_chunks, "Chunk found"

search_chunk_tool = FunctionTool(search_chunk_func, description="Search for chunk related to the query from the paper with the given id")

# This step is automatically performed inside the AssistantAgent if the tool is a Python function.
# web_search_function_tool = FunctionTool(web_search_func, description="Find information on the web")

async def main():
    # Get model client from config.
    async with aiofiles.open("model_config.yaml", "r") as file:
        model_config = yaml.safe_load(await file.read())
    model_client = ChatCompletionClient.load_component(model_config)

    search_paper_agent = AssistantAgent(
        name="assistant_loop",
        model_client=model_client,
        # TODO: these tools are called at the same time,
        # so need to change impl as search_paper -> search_chunk -> summarize
        description="Search for paper related to the query from database",
        tools=[
            search_papaer_func,
        ],
        system_message="Use tools to solve tasks. Reply only 'TERMINATE' if the task is done.",
        max_tool_iterations=10,  # At most 10 iterations of tool calls before stopping the loop.
    )

    search_chunk_agent = AssistantAgent(
        name="search_chunk_agent",
        model_client=model_client,
        description="Search for chunk related to the query from the paper with the given id",
        tools=[
            search_chunk_func,
        ],
    )

    summarize_agent = AssistantAgent(
        name="summarize_agent",
        model_client=model_client,
        description="Summarize the paper",
    )

    # The termination condition is a combination of text termination and max message termination, either of which will cause the chat to terminate.
    termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(10)

    # The group chat will alternate between the assistant and the code executor.
    group_chat = RoundRobinGroupChat([search_paper_agent, search_chunk_agent, summarize_agent], termination_condition=termination)
    
    # `run_stream` returns an async generator to stream the intermediate messages.
    stream = group_chat.run_stream(task="Search for paper on privacy protection. Moreover, search for the concrete implementation.")
    # `Console` is a simple UI to display the stream.
    await Console(stream)

    # Close the connection to the model client.
    await model_client.close()

if __name__ == "__main__":
    asyncio.run(main())