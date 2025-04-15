export type PaperEntry = {
  title: string;
  abstract: string;
  authors: string;
  comments: string;
};

export type RetrieveResult = {
  _additional: {
    distance: number;
  };
} & PaperEntry;

export type GetAllResult = {
  _additional: {
    id: string;
    vector: number[];
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
