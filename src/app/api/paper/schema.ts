import { z } from "zod";
import { PaperEntrySchema, RetrievedPaperEntrySchema } from "@/models/paper";

export const GetAllPapersResponseSchema = z.object({
  papers: z.array(RetrievedPaperEntrySchema),
});
export type GetAllPapersResponse = z.infer<typeof GetAllPapersResponseSchema>;

export const AddPaperRequestSchema = z.object({
  ...PaperEntrySchema.shape,
  encoded: z.string(),
  fullText: z.string(),
});
export type AddPaperRequest = z.infer<typeof AddPaperRequestSchema>;

export const AddPaperResponseSchema = z.object({
  id: z.string(),
});
export type AddPaperResponse = z.infer<typeof AddPaperResponseSchema>;
