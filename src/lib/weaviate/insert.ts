"use server";
import { AddPaperInput, extractMessage } from "./types";
import { getPaperCollection, getPaperChunkCollection } from "./client";
import { PaperEntry } from "@/types/paper";
import { Ok, Err, Result } from "@/lib/result";
import { getChunksMaxChunkWithOverlap } from "@/lib/chunking";
import { PaperChunk } from "@/types/paper";
// Quantization?

// Upload paper to Weaviate
export const addPaper = async (
  paper: AddPaperInput,
): Promise<Result<string>> => {
  try {
    const paperCollection = await getPaperCollection();
    const uuid = await paperCollection.data.insert({
      properties: {
        summary: paper.summary,
        comment: paper.comment || null,
        encoded: paper.encoded,
        info: {
          type: paper.info.type,
          id: paper.info.id,
          title: paper.info.title,
          abstract: paper.info.abstract || null,
          author: paper.info.author,
          journal: paper.info.journal || null,
          volume: paper.info.volume || null,
          number: paper.info.number || null,
          pages: paper.info.pages || null,
          year: paper.info.year || null,
          publisher: paper.info.publisher || null,
        }
      },
    });
    console.log(uuid);
    return Ok(uuid);
  } catch (err) {
    return Err(`Failed to add paper: ${extractMessage(err)}`);
  }
};

// indexing, vecrtors
export const addPaperChunk = async (
  paperEntry: PaperEntry,
  paperEntryUuid: string,
): Promise<Result<string[]>> => {
  try {
    const chunks = getChunksMaxChunkWithOverlap(paperEntry.summary, 100, 0.2);
    const paperChunkCollection = await getPaperChunkCollection();
    const uuids = await Promise.all(chunks.map(async (chunk, index) => {
      const uuid = await paperChunkCollection.data.insert({
        properties: {
          chunk: chunk,
          paperId: paperEntryUuid,
          paperTitle: paperEntry.info.title,
          chunkIndex: index,
        },
      });
      return uuid;
    }));
    return Ok(uuids);
  } catch (err) {
    return Err(`Failed to add paper chunk: ${extractMessage(err)}`);
  }
};

export const getAllChunks = async (): Promise<Result<PaperChunk[]>> => {
  try {
    const paperChunkCollection = await getPaperChunkCollection();
    const iter = paperChunkCollection.iterator();
    const chunks: PaperChunk[] = [];
    for await (const item of iter) {
      chunks.push({
        text: item.properties.chunk as string,
        paperId: item.properties.paperId as string,
        paperTitle: item.properties.paperTitle as string,
        chunkIndex: item.properties.chunkIndex as number,
      });
    }
    return Ok(chunks);
  } catch (err) {
    return Err(`Failed to get all chunks: ${extractMessage(err)}`);
  }
};