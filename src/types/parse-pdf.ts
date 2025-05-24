import { z } from "zod";

export const ParsePdfOutputSchema = z.object({
    text: z.string(),
});

export type ParsePdfOutput = z.infer<typeof ParsePdfOutputSchema>;