"use server";
import {
  RetrievedPaperEntry,
  PaperEntrySchema,
} from "@/models/paper";
import { getPaperCollection } from "./client";
import { Result, Ok, Err } from "../result";

export const searchSimilar = async (query: string): Promise<Result<RetrievedPaperEntry[]>> => {
  try {
    const paperCollection = await getPaperCollection();
    const result = await paperCollection.query.nearText([query], {
      returnMetadata: ['distance'],
      limit: 10,
    });
    const r: RetrievedPaperEntry[] = result.objects.map((item) => {
      const parsed = PaperEntrySchema.safeParse(item.properties);
      if (!parsed.success) {
        console.error(`Failed to parse paper: ${parsed.error}`);
        return null;
      }
      return {
        metadata: {
          uuid: item.uuid,
          distance: item.metadata?.distance,
        },
        ...parsed.data,
      };
    }).filter((item) => item !== null);

    return Ok(r);
  } catch (err) {
    return Err(`Failed to search similar: ${err}`);
  }
};




