"use server";
import {
  RetrievedPaperEntry,
} from "@/models/paper";
import { getPaperCollection } from "./client";
import { parseWeaviateObject } from "./parse";
import { Result, Ok, Err } from "../result";

export const searchSimilar = async (query: string): Promise<Result<RetrievedPaperEntry[]>> => {
  try {
    const paperCollection = await getPaperCollection();
    const result = await paperCollection.query.nearText([query], {
      targetVector: ["summary"], 
      limit: 10,
    });
    console.log(result);
    const r: RetrievedPaperEntry[] = result.objects.map((item) => {
      const parsed = parseWeaviateObject(item);
      switch (parsed.type) {
        case "success":
          return {
            metadata: {
              uuid: item.uuid,
            },
            ...parsed.data,
          };
        case "error":
          return null;
      }
    }).filter((item) => item !== null);

    return Ok(r);
  } catch (err) {
    return Err(`Failed to search similar: ${err}`);
  }
};




