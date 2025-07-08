import weaviate
from weaviate.classes.query import MetadataQuery
import os
from dotenv import load_dotenv

load_dotenv()

openai_api_key = os.environ["OPENAI_API_KEY"]

client = weaviate.connect_to_local(
    host="localhost",  # Use a string to specify the host
    port=8080,
    grpc_port=50051,
    headers={"X-OpenAI-Api-Key": openai_api_key},
)

print(client.is_ready())

paper_collection = client.collections.get("Paper")

result = paper_collection.query.near_text(
    query="machine learning",
    limit=10,
    return_metadata=MetadataQuery(distance=True)
)

for o in result.objects:
    print(o.properties["info"]["title"])
    print(o.metadata.distance)

client.close()