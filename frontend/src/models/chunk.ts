import { z } from "zod";

export const PaperChunkSchema = z.object({
    text: z.string(),
    paperId: z.string(),
    paperTitle: z.string(),
    chunkIndex: z.number(),
});

export const RetrievedPaperChunkSchema = z.object({
    text: z.string(),
    paperId: z.string(),
    paperTitle: z.string(),
    chunkIndex: z.number(),
    metadata: z.object({
        uuid: z.string(),
        distance: z.number().optional(),
    }),
});

export type PaperChunk = z.infer<typeof PaperChunkSchema>;
export type RetrievedPaperChunk = z.infer<typeof RetrievedPaperChunkSchema>;

export const PaperChunksSchema = z.array(PaperChunkSchema);
export const RetrievedPaperChunksSchema = z.array(RetrievedPaperChunkSchema);
