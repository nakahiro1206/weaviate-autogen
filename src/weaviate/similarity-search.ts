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
import { PaperEntry, PaperInfoSchema } from "@/types/paper";
import { WeaviateGenericObject, WeaviateNonGenericObject, Properties } from "weaviate-client";

export const searchSimilar = async ({
  query,
}: SearchSimilarInput): Promise<SearchSimilarResponse | Err> => {
  try {
    const paperCollection = await weaviateClientHandle.getPaperCollection();
    const result = await paperCollection.query.nearText([query], {
      returnProperties: ["chunk", "chapter_title", "chunk_index"],
      limit: 3,
    });
    console.log(result);
    const r: RetrieveResult[] = result.objects.map((item) => {
      const parsed = parseWeaviateObject(item);
      if (!parsed) {
        return null;
      }
      return {
        ...parsed,
        metadata: {
          chunk: item.properties["chunk"] as string,
          chapter_title: item.properties["chapter_title"] as string,
          chunk_index: item.properties["chunk_index"] as string,
        },
      };
    }).filter((item) => item !== null);

    return {
      __typename: "SearchSimilarResponse",
      results: r,
    };
  } catch (err) {
    return extractMessage(err);
  }
};

const parseWeaviateObject = (item: WeaviateGenericObject<Properties> | WeaviateNonGenericObject): PaperEntry | null => {
  console.log(item.properties["info"]);
  const info = PaperInfoSchema.safeParse(item.properties["info"]);
  if (!info.success) {
    console.error(info.error);
    return null;
  }
  return {
    summary: item.properties["summary"] as string,
    comment: item.properties["comment"] as string || undefined,
    encoded: item.properties["encoded"] as string,
    info: info.data,
  }
}

export const getAllPapers = async (): Promise<GetAllResponse | Err> => {
  try {
    const paperCollection = await weaviateClientHandle.getPaperCollection();
    const iter = paperCollection.iterator();
    const res: GetAllResult[] = [];
    for await (const item of iter) {
      const parsed = parseWeaviateObject(item);
      if (!parsed) {
        continue;
      }
      res.push({
        metadata: {
          uuid: item.uuid,
        },
        ...parsed,
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
