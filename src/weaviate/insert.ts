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
        summary: paper.summary,
        comment: paper.comment || null,
        encoded: paper.encoded,
        info: {
          type: paper.info.type,
          id: paper.info.id,
          title: paper.info.title,
          abstract: paper.info.abstract || null,
          author: paper.info.author,
          journal: paper.info.journal || null,
          volume: paper.info.volume || null,
          number: paper.info.number || null,
          pages: paper.info.pages || null,
          year: paper.info.year || null,
          publisher: paper.info.publisher || null,
        }
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
