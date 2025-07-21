import weaviate
from weaviate import WeaviateClient
from weaviate.classes.query import MetadataQuery, Filter
import os
from dotenv import load_dotenv
from typing import List, Tuple, Dict
from result import Result, Ok, Err, is_err
from models.paper import validate_paper_entry
from models.chunk import validate_paper_chunk

load_dotenv()
openai_api_key = os.environ["OPENAI_API_KEY"]

class WeaviateClientContext:
    def __init__(self):
        client = weaviate.connect_to_local(
            host="localhost",  # Use a string to specify the host
            port=8080,
            grpc_port=50051,
            headers={"X-OpenAI-Api-Key": openai_api_key},
        )
        self.client = client

    def __enter__(self) -> Result[WeaviateClient, str]:
        if self.client is None or not self.client.is_ready():
            return Err("Weaviate client is not initialized or not ready")
        return Ok(self.client)

    def __exit__(self, exc_type, exc_value, traceback):
        if self.client is not None:
            self.client.close()
            self.client = None

def search_paper(query: str) -> str | List[Dict[str, str | float | None]]:
    with WeaviateClientContext() as r:
        if is_err(r):
            return r.unwrap_err()
        client = r.unwrap()
        paper_collection = client.collections.get("Paper")
        result = paper_collection.query.near_text(
            query=query,
            limit=10,
            return_metadata=MetadataQuery(distance=True)
        )
        if len(result.objects) == 0:
            return f"No paper found related to the query: {query}"
        else:
            retrieved_paper_entries: List[Dict[str, str | float | None]] = []
            for o in result.objects:
                validation_result = validate_paper_entry({
                    **o.properties,
                    "metadata": {
                        "uuid": o.uuid.hex,
                        "distance": o.metadata.distance
                    }
                })
                if validation_result.is_ok():
                    retrieved_paper_entries.append(validation_result.unwrap().to_ai_readable())
                else:
                    continue
            return retrieved_paper_entries
        
def add_hyphen_to_uuid(uuid: str) -> str:
    return f"{uuid[:8]}-{uuid[8:12]}-{uuid[12:16]}-{uuid[16:20]}-{uuid[20:]}"

def search_chunk(paper_id: str, query: str) -> str | List[Dict[str, str | float | None]]:
    with WeaviateClientContext() as r:
        if is_err(r):
            return r.unwrap_err()
        client = r.unwrap()

        # ensure the paper exists
        paper_collection = client.collections.get("Paper")
        result = paper_collection.query.fetch_object_by_id(paper_id)
        if result is None:
            return "Paper not found"

        chunk_collection = client.collections.get("PaperChunk")

        # add hyphen to paper_id(uuid)
        paper_id_with_hyphen = add_hyphen_to_uuid(paper_id)
        result = chunk_collection.query.near_text(
            filters=Filter.by_property("paperId").equal(paper_id_with_hyphen),
            query=query,
            limit=10,
            return_metadata=MetadataQuery(distance=True)
        )
        if len(result.objects) == 0:
            return f"No chunk found related to the query: {query}"

        retrieved_paper_chunks: List[Dict[str, str | float | None]] = []
        for o in result.objects:
            validation_result = validate_paper_chunk({
                **o.properties,
                "metadata": {
                    "uuid": o.uuid.hex,
                    "distance": o.metadata.distance
                }
            })
            if validation_result.is_ok():
                retrieved_paper_chunks.append(validation_result.unwrap().to_ai_readable())
            else:
                continue
        return retrieved_paper_chunks