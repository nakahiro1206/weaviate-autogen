import { PaperEntry } from "@/types/paper";

export type RetrieveResult = {
  metadata: {
    chunk: string;
    chapter_title: string;
    chunk_index: string;
  };
} & PaperEntry;

export type GetAllResult = {
  metadata: {
    uuid: string;
  };
} & PaperEntry;

export type AddPaperInput = PaperEntry;

export type AddPaperResponse = {
  __typename: "AddPaperResponse";
  id: string;
};

export type SearchSimilarInput = {
  query: string;
};

export type SearchSimilarResponse = {
  __typename: "SearchSimilarResponse";
  results: RetrieveResult[];
};

export type GetAllResponse = {
  __typename: "GetAllResponse";
  results: GetAllResult[];
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
