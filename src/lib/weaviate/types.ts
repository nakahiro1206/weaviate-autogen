import { PaperEntry, PaperEntrySchema } from "@/types/paper";
import { z } from "zod";

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

export type AddPaperInput = PaperEntry;

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
