"use server";

import { client } from "./client";
import pdf from "pdf-parse";

export const summarizeDocument = async (
  document: File,
): Promise<string | null> => {
  // body size, PDF validation
  // Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
  const buffer = Buffer.from(await document.arrayBuffer());
  const data = await pdf(buffer);
  console.log(data);
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that summarizes documents.",
      },
      {
        role: "user",
        content: `Please summarize the following document`,
      },
      {
        role: "user",
        content: `${data.text}`,
      },
    ],
    // stream: true,
  });

  return response.choices[0]?.message.content;
};
