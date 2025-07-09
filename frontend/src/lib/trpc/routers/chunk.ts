import { getPaperChunksByPaperIdWithLimit, isPaperChunkIndexed } from "@/lib/weaviate/fetch";
import { addPaperChunk } from "@/lib/weaviate/insert";
import { procedure, router } from "../server";
import z from "zod";
import { PaperEntrySchema } from "@/models/paper";

export const chunkRouter = router({
    isChunkIndexed: procedure
    .input(z.object({
        paperId: z.string(),
    }))
    .query(async ({ input }) => {
        const result = await isPaperChunkIndexed(input.paperId);
        return result;
    }),
    getPaperChunksByPaperIdWithLimit: procedure
    .input(z.object({
        paperId: z.string(),
        limit: z.number().min(1).max(100).optional(),
    }))
    .query(async ({ input }) => {
        const result = await getPaperChunksByPaperIdWithLimit(input.paperId, input.limit);
        return result;
    }),
    createChunk: procedure
    .input(z.object({
        paperEntry: PaperEntrySchema,
        paperEntryUuid: z.string(),
    }))
    .mutation(async ({ input }) => {
        const result = await addPaperChunk(input.paperEntry, input.paperEntryUuid);
        return result;
    }),
});