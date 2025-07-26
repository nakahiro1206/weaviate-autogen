import weaviate
from weaviate import WeaviateClient
from weaviate.classes.query import MetadataQuery
import os
from dotenv import load_dotenv
from typing import List, Tuple, Dict, Union, Any
from result import Result, Ok, Err, is_err
from models.paper import validate_paper_entry
from models.chunk import validate_paper_chunk
import numpy as np

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

# TODO: implement tSNE
def get_all_papers(include_vectors: bool = False) -> Tuple[List[Dict[str, Any]], List[np.ndarray]]:
    with WeaviateClientContext() as r:
        if is_err(r):
            return [], []
        client = r.unwrap()
        paper_collection = client.collections.get("Paper")
        res = []
        vector_list: List[np.ndarray] = []
        for item in paper_collection.iterator(
            include_vector=True,
        ):
            print(item.uuid, item.properties.keys())
            validation_result = validate_paper_entry({
                **item.properties,
                "metadata": {
                    "uuid": item.uuid.hex,
                    "distance": item.metadata.distance
                }
            })
            if validation_result.is_ok():
                paper_data = validation_result.unwrap().to_ai_readable()
                if include_vectors and item.vector is not None:
                    # vectors should be shaped [1536]
                    v = item.vector["summaryEmbedding"]
                    vector_list.append(np.array(v).flatten())
                res.append(paper_data)
            else:
                continue
        return res, vector_list
