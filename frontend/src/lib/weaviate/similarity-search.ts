"use server";
import {
  RetrievedPaperEntry,
  PaperEntrySchema,
} from "@/models/paper";
import { getPaperChunkCollection, getPaperCollection } from "./client";
import { Result, Ok, Err } from "../result";
import { PaperChunkSchema, RetrievedPaperChunk } from "@/models/chunk";

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

export const searchChunkSimilar = async (uuid: string, query: string): Promise<Result<RetrievedPaperChunk[]>> => {
  try {
    const paperChunkCollection = await getPaperChunkCollection();
    const result = await paperChunkCollection.query.nearText([query], {
      filters: paperChunkCollection.filter.byProperty('paperId').equal(uuid),
      limit: 10,
      returnMetadata: ['distance'],
    });
    const r: RetrievedPaperChunk[] = result.objects.map((item) => {
      const parsed = PaperChunkSchema.safeParse(item.properties);
      if (!parsed.success) {
        console.error(`Failed to parse paper chunk: ${parsed.error}`);
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
    return Err(`Failed to search chunk similar: ${err}`);
  }
};




