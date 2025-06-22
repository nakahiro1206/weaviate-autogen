import { z } from "zod";

export const SummarizeDocumentInputSchema = z.object({
  text: z.string(),
});

export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

export const SummarizeDocumentResponseSchema = z.object({
  summary: z.string(),
});

export type SummarizeDocumentResponse = z.infer<typeof SummarizeDocumentResponseSchema>;