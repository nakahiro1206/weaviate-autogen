"use server";
import { PaperEntry } from "@/service/entities/paper";
import { PaperChunk } from "@/service/entities/chunk";
import { getPaperCollection, getPaperChunkCollection } from "./client";
import { Ok, Err, Result } from "@/lib/result";
import { getChunksFixedSizeWithOverlap, getChunksMaxChunkWithOverlap } from "@/lib/chunking";
// Quantization?

// Upload paper to Weaviate
export const addPaper = async (
  paper: PaperEntry,
): Promise<Result<string>> => {
  try {
    const paperCollection = await getPaperCollection();
    const uuid = await paperCollection.data.insert({
      properties: {
        summary: paper.summary,
        comment: paper.comment || null,
        encoded: paper.encoded,
        fullText: paper.fullText,
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
    return Err(`Failed to add paper: ${err}`);
  }
};

// indexing, vecrtors
export const addPaperChunk = async (
  paperEntry: PaperEntry,
  paperEntryUuid: string,
): Promise<Result<string[]>> => {
  try {
    const chunks = getChunksFixedSizeWithOverlap(paperEntry.fullText, 100, 0.2); // 100 words per chunk, 20% overlap
    const paperChunkCollection = await getPaperChunkCollection();
    const res = await paperChunkCollection.data.insertMany(chunks.map((chunk, index) => ({
      properties: {
        chunk: chunk,
        paperId: paperEntryUuid,
        paperTitle: paperEntry.info.title,
        chunkIndex: index,
      },
    })));
    const uuids = res.allResponses.map((res) => {
      if (typeof res === 'string') {
        return res;
      } else {
        return null; // res.message
      }
    }).filter((uuid) => uuid !== null);
    return Ok(uuids);
  } catch (err) {
    return Err(`Failed to add paper chunk: ${err}`);
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
    return Err(`Failed to get all chunks: ${err}`);
  }
};