"use server";
import {
  Err,
  extractMessage,
  SearchSimilarInput,
  SearchSimilarResponse,
  RetrieveResult,
  GetAllResponse,
  GetAllResult,
} from "./types";
import { weaviateClientHandle } from "./client";

export const searchSimilar = async ({
  query,
}: SearchSimilarInput): Promise<SearchSimilarResponse | Err> => {
  try {
    const paperCollection = await weaviateClientHandle.getPaperCollection();
    const result = await paperCollection.query.nearText(query, {
      limit: 5,
      returnMetadata: ["distance"],
    });
    const r: RetrieveResult[] = result.objects.map((item) => {
      // console.log(item.metadata?.distance);
      return {
        title: item.properties["title"] as string,
        authors: item.properties["authors"] as string,
        abstract: item.properties["abstract"] as string,
        comments: item.properties["comments"] as string,
        encoded: item.properties["encoded"] as string,
        metadata: {
          distance: item.metadata?.distance,
        },
      };
    });

    return {
      __typename: "SearchSimilarResponse",
      results: r,
    };
  } catch (err) {
    return extractMessage(err);
  }
};

export const getAllPapers = async (): Promise<GetAllResponse | Err> => {
  try {
    const paperCollection = await weaviateClientHandle.getPaperCollection();
    const iter = paperCollection.iterator();
    const res: GetAllResult[] = [];
    for await (const item of iter) {
      res.push({
        metadata: {
          uuid: item.uuid,
        },
        title: item.properties["title"] as string,
        authors: item.properties["authors"] as string,
        abstract: item.properties["abstract"] as string,
        comments: item.properties["comments"] as string,
        encoded: item.properties["encoded"] as string,
      });
    }

    return {
      __typename: "GetAllResponse",
      results: res,
    };
  } catch (err) {
    return extractMessage(err);
  }
};
