// This is a server-side module. Do not import this directly in client components.
// Use this only in API routes or server components.
"use server";
import weaviate, {
    vectorizer,
    WeaviateClient,
  } from "weaviate-client";
import { mapZodSchemaToWeaviateProperties } from "./map";
import { PaperEntrySchema, } from "@/models/paper";
import { PaperChunkSchema } from "@/models/chunk";

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
  
  // Use the recursive schema mapping to get properties
  const properties = mapZodSchemaToWeaviateProperties(PaperEntrySchema);
  
  const collection = await client.collections.create({
    name: "Paper",
    vectorizers: [
      vectorizer.text2VecOpenAI({
        name: "summaryEmbedding",
        sourceProperties: ["summary"],
        // vectorIndexConfig: configure.vectorIndex.hnsw()   // (Optional) Set the vector index configuration
      }),
    ],
    properties: properties,
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
  
  // Use the recursive schema mapping to get properties
  const properties = mapZodSchemaToWeaviateProperties(PaperChunkSchema);
  
  const collection = await client.collections.create({
    name: "PaperChunk",
    vectorizers: [
      vectorizer.text2VecOpenAI({
        name: "chunkEmbedding",
        sourceProperties: ["text"], // Updated to match the schema field name
      }),
    ],
    properties: properties,
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

  