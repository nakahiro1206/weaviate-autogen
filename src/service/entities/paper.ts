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
  
export type PaperEntry = z.infer<typeof PaperEntrySchema>;

export type RetrieveResult = {
  metadata: {
    uuid: string;
  };
} & PaperEntry;

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

export type SearchSimilarInput = {
  query: string;
};

export type SearchSimilarResponse = {
  __typename: "SearchSimilarResponse";
  results: RetrieveResult[];
};

export type Err = {
  __typename: "Err";
  message?: string;
};

export const extractMessage = (error: unknown): Err => {
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof error.message === "string") {
      return {
        __typename: "Err",
        message: error.message,
      };
    }
  }
  return {
    __typename: "Err",
  };
};
