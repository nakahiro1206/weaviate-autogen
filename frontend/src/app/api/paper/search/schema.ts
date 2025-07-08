import { z } from "zod";
import { RetrievedPaperEntrySchema } from "@/models/paper";

export const SearchSimilarResponseSchema = z.object({
    results: z.array(RetrievedPaperEntrySchema),
});

export type SearchSimilarResponse = z.infer<typeof SearchSimilarResponseSchema>;

export const SearchSimilarInputSchema = z.object({
    query: z.string(),
});

export type SearchSimilarInput = z.infer<typeof SearchSimilarInputSchema>;