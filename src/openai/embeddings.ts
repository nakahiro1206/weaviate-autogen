import { client } from "./client";

// Helper: Embed text using OpenAI
export const getEmbedding = async (text: string): Promise<number[]> => {
  const res = await client.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return res.data[0].embedding;
};

// const response = await openAIClient.responses.create({
//   model: "gpt-4o",
//   instructions: "You are a coding assistant that talks like a pirate",
//   input: "Are semicolons optional in JavaScript?",
// });
