// you cannot use use client here.
// otherwise, all the methods will be passed as undefined.
import weaviate, {
  WeaviateClient,
  vectorizer,
  dataType,
  Collection,
  Properties,
} from "weaviate-client";

export class WeaviateClientHandle {
  private client: WeaviateClient | undefined;
  private paperCollection:
    | Collection<Properties | undefined, string>
    | undefined;

  constructor() {
    this.client = undefined;
    this.paperCollection = undefined;
  }

  async connect() {
    this.client = await weaviate.connectToLocal({
      host: "localhost", // URL only, no http prefix
      port: 8080,
      headers: {
        "X-OpenAI-Api-Key": process.env["OPENAI_API_KEY"] || "",
      },
    });
    return this.client;
  }

  async disconnect() {
    await this.client?.close();
  }

  async createCollection() {
    const client = this.client || (await this.connect());
    this.paperCollection = await client.collections.create({
      name: "Paper",
      vectorizers: [
        vectorizer.text2VecOpenAI({
          name: "abstractEmbedding",
          sourceProperties: ["abstract"],
          // vectorIndexConfig: configure.vectorIndex.hnsw()   // (Optional) Set the vector index configuration
        }),
      ],
      properties: [
        { name: "title", dataType: dataType.TEXT },
        { name: "abstract", dataType: dataType.TEXT },
        { name: "authors", dataType: dataType.TEXT },
        { name: "comments", dataType: dataType.TEXT },
        { name: "encoded", dataType: dataType.TEXT },
      ],
    });
    return this.paperCollection;
  }

  async getPaperCollection() {
    try {
      return await this.createCollection();
    } catch (_) {
      const client = this.client || (await this.connect());
      return client.collections.get("Paper");
    }
  }
}

export const weaviateClientHandle = new WeaviateClientHandle();
