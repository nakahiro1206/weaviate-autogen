"use server";

import { client } from "./client";

export const summarizeDocument = async (
  text: string,
): Promise<string | null> => {
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
        content: text,
      },
    ],
    // stream: true,
  });

  return response.choices[0]?.message.content;
};
