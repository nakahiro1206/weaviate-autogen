"use server";

import { Err, Ok, Result } from "@/lib/result";
import { client } from "./client";

export const summarizeDocument = async (
  text: string,
): Promise<Result<string | null>> => {
  try {
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

    return Ok(response.choices[0]?.message.content);
  } catch (error) {
    return Err(`Failed to summarize document: ${error}`);
  }
};
