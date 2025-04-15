import { client } from "./client";
import {
  Err,
  extractMessage,
  SearchSimilarInput,
  SearchSimilarResponse,
  RetrieveResult,
  GetAllResponse,
  GetAllResult,
} from "./types";

export const searchSimilar = async ({
  query,
}: SearchSimilarInput): Promise<SearchSimilarResponse | Err> => {
  const vector = new Array<number>(10).fill(1);
  try {
    const result = await client.graphql
      .get()
      .withClassName("Paper")
      .withFields(
        // if you attribute certainty in this search query, you can specify allowed certainty.
        "title abstract authors comments _additional {certainty}",
      )
      .withNearVector({ vector, certainty: 0.7 })
      .withLimit(5)
      .do();

    const results = result.data.Get.Paper as RetrieveResult[];
    return {
      __typename: "SearchSimilarResponse",
      results: results,
    };
  } catch (err) {
    return extractMessage(err);
  }
};

export const getAllPapers = async (): Promise<GetAllResponse | Err> => {
  try {
    const result = await client.graphql
      .get()
      .withClassName("Paper")
      .withFields(
        // you can get additional fields named id and vector
        "title abstract authors comments _additional { id vector }",
      )
      .withLimit(100)
      .do();

    const results = result.data.Get.Paper as GetAllResult[];
    return {
      __typename: "GetAllResponse",
      results: results,
    };
  } catch (err) {
    return extractMessage(err);
  }
};
