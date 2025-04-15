import { client } from "./client";
import { AddPaperInput, AddPaperResponse, Err, extractMessage } from "./types";

// Quantization?

// Upload paper to Weaviate
export const addPaper = async (
  paper: AddPaperInput,
): Promise<AddPaperResponse | Err> => {
  const vector = new Array<number>(10).fill(1); // emb(paper.abst)
  try {
    const res = await client.data
      .creator()
      .withClassName("Paper")
      .withProperties(paper)
      .withVector(vector)
      .do();
    return {
      __typename: "AddPaperResponse",
      id: res.id || "",
    };
  } catch (err) {
    return extractMessage(err);
  }
};
