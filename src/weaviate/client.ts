import weaviate from "weaviate-ts-client";

// Initialize Weaviate
export const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});
