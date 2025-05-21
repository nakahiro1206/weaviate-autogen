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
  info: PaperInfoSchema,
});

export const PaperEntryListSchema = z.array(PaperEntrySchema);

export type PaperEntry = z.infer<typeof PaperEntrySchema>;

export type PaperEntryList = z.infer<typeof PaperEntryListSchema>;

export const PaperChunkSchema = z.object({
  text: z.string(),
  paperId: z.string(),
  paperTitle: z.string(),
  chunkIndex: z.number(),
});

export type PaperChunk = z.infer<typeof PaperChunkSchema>;
