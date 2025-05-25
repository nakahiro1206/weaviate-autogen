"use server";
import {
  Err,
  extractMessage,
  SearchSimilarInput,
  SearchSimilarResponse,
  RetrieveResult,
} from "@/service/entities/paper";
import { getPaperCollection } from "./client";
import { parseWeaviateObject } from "./parse";

export const searchSimilar = async ({
  query,
}: SearchSimilarInput): Promise<SearchSimilarResponse | Err> => {
  try {
    const paperCollection = await getPaperCollection();
    const result = await paperCollection.query.nearText([query], {
      limit: 3,
    });
    console.log(result);
    const r: RetrieveResult[] = result.objects.map((item) => {
      const parsed = parseWeaviateObject(item);
      switch (parsed.type) {
        case "success":
          return {
            metadata: {
              uuid: item.uuid,
            },
            ...parsed.data,
          };
        case "error":
          return null;
      }
    }).filter((item) => item !== null);

    return {
      __typename: "SearchSimilarResponse",
      results: r,
    };
  } catch (err) {
    return extractMessage(err);
  }
};




