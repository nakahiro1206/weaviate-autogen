import { procedure, router } from "../server";
import { getPapersWithLimit, getPaperById } from "@/lib/weaviate/fetch";
import { searchSimilar } from "@/lib/weaviate/similarity-search";
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
    getPapersNearText: procedure
    .input(z.object({
        text: z.string(),
    }))
    .query(async ({ input }) => {
        if (input.text === "") {
            // return top 20 papers
            const papers = await getPapersWithLimit(20);
            return papers;
        }
        const papers = await searchSimilar(input.text);
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