import { z } from "zod";

export const PaperChunkSchema = z.object({
    text: z.string(),
    paperId: z.string(),
    paperTitle: z.string(),
    chunkIndex: z.number(),
});
  
export type PaperChunk = z.infer<typeof PaperChunkSchema>;

export const PaperChunksSchema = z.array(PaperChunkSchema);

export const ChunkResultSchema = z.object({
    chunks: z.array(z.string()),
});

export type ChunkResult = z.infer<typeof ChunkResultSchema>;
