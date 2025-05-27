import { z } from "zod";

export const PaperInfoSchema = z.object({
    type: z.string(),
    id: z.string(),
    abstract: z.string().optional(),
    title: z.string(),
    author: z.string(),
    journal: z.string().optional(),
    volume: z.string().optional(),
    number: z.string().optional(),
    pages: z.string().optional(),
    year: z.string().optional(),
    publisher: z.string().optional(),
});
export type PaperInfo = z.infer<typeof PaperInfoSchema>;

export const PaperEntrySchema = z.object({
    summary: z.string(),
    comment: z.string().optional(),
    encoded: z.string(),
    fullText: z.string(),
    info: PaperInfoSchema,
});
  
export type PaperEntry = z.infer<typeof PaperEntrySchema>;

export const RetrieveResultSchema = z.object({
  metadata: z.object({
    uuid: z.string(),
  }),
  ...PaperEntrySchema.shape,
});
export type RetrieveResult = z.infer<typeof RetrieveResultSchema>;
export const RetrieveResultArraySchema = z.array(RetrieveResultSchema);


export const GetAllPapersResultSchema = z.array(z.object({
  metadata: z.object({
    uuid: z.string(),
  }),
  ...PaperEntrySchema.shape,
}));
export type GetAllPapersResult = z.infer<typeof GetAllPapersResultSchema>;

export const AddPaperResponseSchema = z.object({
  id: z.string(),
});
export type AddPaperResponse = z.infer<typeof AddPaperResponseSchema>;
