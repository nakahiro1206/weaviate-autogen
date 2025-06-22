import { z } from "zod";
import { RetrievedPaperEntrySchema } from "@/models/paper";

export const GetAllPapersResponseSchema = z.object({
  papers: z.array(RetrievedPaperEntrySchema),
});
export type GetAllPapersResponse = z.infer<typeof GetAllPapersResponseSchema>;

export const AddPaperResponseSchema = z.object({
  id: z.string(),
});
export type AddPaperResponse = z.infer<typeof AddPaperResponseSchema>;
