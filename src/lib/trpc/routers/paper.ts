import { procedure, router } from "../server";
import { getPapersWithLimit, getPaperById } from "@/lib/weaviate/fetch";
import { z } from "zod";

export const paperRouter = router({
    getPapersWithLimit: procedure
    .input(z.object({
        limit: z.number().min(1).max(100).optional(),
    }))
    .query(async ({ input }) => {
        const papers = await getPapersWithLimit(input.limit);
        return papers;
    }),
    getPaperById: procedure
    .input(z.object({
        id: z.string(),
    }))
    .query(async ({ input }) => {
        const paper = await getPaperById(input.id);
        return paper;
    }),
});