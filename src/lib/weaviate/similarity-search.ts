"use server";
import {
  RetrieveResult,
} from "@/service/entities/paper";
import { getPaperCollection } from "./client";
import { parseWeaviateObject } from "./parse";
import { Result, Ok, Err } from "../result";

export const searchSimilar = async (query: string): Promise<Result<RetrieveResult[]>> => {
  try {
    const paperCollection = await getPaperCollection();
    const result = await paperCollection.query.nearText([query], {
      limit: 10,
    });
    console.log(result);
    const r: RetrieveResult[] = result.objects.map((item) => {
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




