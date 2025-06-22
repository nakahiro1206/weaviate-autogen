import { z } from "zod";
import { PaperChunkSchema } from "@/models/chunk";
import { PaperEntrySchema } from "@/models/paper";

export const AddPaperChunkResponseSchema = z.object({
    chunkIds: z.array(z.string()),
});

export type AddPaperChunkResponse = z.infer<typeof AddPaperChunkResponseSchema>;

export const FetchAllChunksResponseSchema = z.object({
    chunks: z.array(PaperChunkSchema),
})

export type FetchAllChunksResponse = z.infer<typeof FetchAllChunksResponseSchema>;

export const AddPaperChunkInputSchema = z.object({
    paperEntry: PaperEntrySchema,
    paperEntryUuid: z.string(),
});

export type AddPaperChunkInput = z.infer<typeof AddPaperChunkInputSchema>;