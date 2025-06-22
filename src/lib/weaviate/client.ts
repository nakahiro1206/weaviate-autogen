// This is a server-side module. Do not import this directly in client components.
// Use this only in API routes or server components.
"use server";
import weaviate, {
    vectorizer,
    dataType,
    WeaviateClient,
  } from "weaviate-client";

let clientInstance: WeaviateClient | null = null;

const getClient = async (): Promise<WeaviateClient> => {
  if (clientInstance === null) {
    clientInstance = await weaviate.connectToLocal({
      host: "localhost", // URL only, no http prefix
      port: 8080,
      headers: {
        "X-OpenAI-Api-Key": process.env["OPENAI_API_KEY"] || "",
      },
    });
  }
  return clientInstance;
};

export const withWeaviateClient = async (fn: (client: WeaviateClient) => Promise<void>) => {
  const client = await getClient();
  try {
    await fn(client);
  } catch (error) {
    // If we get a connection error, we might want to reset the client
    if (error instanceof Error && error.message.includes('connection')) {
      clientInstance = null;
    }
    throw error;
  }
};

// Export a function to explicitly close the client when needed (e.g., during application shutdown)
export const closeClient = async () => {
  if (clientInstance) {
    await clientInstance.close();
    clientInstance = null;
  }
};

export const createPaperCollection = async () => {
  const client = await getClient();
  console.log("createPaperCollection aaa");
  const collection = await client.collections.create({
    name: "Paper",
    vectorizers: [
      vectorizer.text2VecOpenAI({
        name: "summaryEmbedding",
        sourceProperties: ["summary"],
        // vectorIndexConfig: configure.vectorIndex.hnsw()   // (Optional) Set the vector index configuration
      }),
    ],
    properties: [
      { name: "summary", dataType: dataType.TEXT },
      { name: "comment", dataType: dataType.TEXT },
      { name: "encoded", dataType: dataType.TEXT },
      { name: "fullText", dataType: dataType.TEXT },
      { name: "info", dataType: dataType.OBJECT, nestedProperties: [
        { name: "type", dataType: dataType.TEXT },
        { name: "id", dataType: dataType.TEXT },
        { name: "title", dataType: dataType.TEXT },
        { name: "abstract", dataType: dataType.TEXT },
        { name: "author", dataType: dataType.TEXT },
        { name: "journal", dataType: dataType.TEXT },
        { name: "volume", dataType: dataType.TEXT },
        { name: "number", dataType: dataType.TEXT },
        { name: "pages", dataType: dataType.TEXT },
        { name: "year", dataType: dataType.TEXT },
        { name: "publisher", dataType: dataType.TEXT },
      ] },
    ],
  });
  console.log("createPaperCollection bbb");
  return collection;
}

export const getPaperCollection = async () => {
  const client = await getClient();
  if (await client.collections.exists("Paper")) {
    return client.collections.get("Paper")
  } else {
    return createPaperCollection();
  }
}

export const createPaperChunkCollection = async () => {
  const client = await getClient();
  const collection = await client.collections.create({
    name: "PaperChunk",
    vectorizers: [
      vectorizer.text2VecOpenAI({
        name: "chunkEmbedding",
        sourceProperties: ["chunk"],
      }),
    ],
    properties: [
      { name: "chunk", dataType: dataType.TEXT },
      { name: "paperId", dataType: dataType.TEXT },
      { name: "paperTitle", dataType: dataType.TEXT },
      { name: "chunkIndex", dataType: dataType.NUMBER },
    ],
  });
  return collection;
}

export const getPaperChunkCollection = async () => {
  const client = await getClient();
  if (await client.collections.exists("PaperChunk")) {
    return client.collections.get("PaperChunk")
  } else {
    return createPaperChunkCollection();
  }
}

  