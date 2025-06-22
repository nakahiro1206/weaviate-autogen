"use server";

import { Err, Ok, Result } from "@/lib/result";
import { client } from "./client";

export const summarizeDocument = async (
  text: string,
): Promise<Result<string | null>> => {
  try {
    const stream = client.chat.completions.stream({
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
    });

    let response = "";
    for await (const chunk of stream) {
      response += chunk.choices[0]?.delta.content ?? "";
    }

    const result = await stream.finalChatCompletion();
    return Ok(result.choices[0]?.message.content ?? "");
  } catch (error) {
    return Err(`Failed to summarize document: ${error}`);
  }
};

export const summarizeDocumentStream = async (
  text: string,
): Promise<AsyncGenerator<string, void, unknown>> => {
  const stream = client.chat.completions.stream({
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
  });

  return (async function* () {
    try {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      throw new Error(`Failed to summarize document: ${error}`);
    }
  })();
};
