"use server";
import { AddPaperInput, AddPaperResponse, Err, extractMessage } from "./types";
import { weaviateClientHandle } from "./client";

// Quantization?

// Upload paper to Weaviate
export const addPaper = async (
  paper: AddPaperInput,
): Promise<AddPaperResponse | Err> => {
  try {
    const paperCollection = await weaviateClientHandle.getPaperCollection();
    const uuid = await paperCollection.data.insert({
      properties: {
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors,
        comments: paper.comments,
        encoded: paper.encoded,
      },
    });
    console.log(uuid);
    return {
      __typename: "AddPaperResponse",
      id: uuid || "",
    };
  } catch (err) {
    return extractMessage(err);
  }
};
