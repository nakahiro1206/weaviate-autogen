import { GetAllPapersResult, extractMessage } from "./types";
import { getPaperCollection } from "./client";
import { parseWeaviateObject } from "./parse";
import { match, Ok, Err, Result } from "@/lib/result";

export const getAllPapers = async (): Promise<Result<GetAllPapersResult>> => {
    try {
      const paperCollection = await getPaperCollection();
      const iter = paperCollection.iterator();
      const res: GetAllPapersResult = [];
      for await (const item of iter) {
        const result = parseWeaviateObject(item);
        match(result, {
            onSuccess: (data) => {
                res.push({
                    metadata: {
                        uuid: item.uuid,
                    },
                    ...data,
                });
            },
            onError: (msg) => {
                console.error(msg);
            },
        })
      }
      return Ok(res);
    } catch (err) {
      return Err(`Failed to get all papers: ${extractMessage(err)}`);
    }
  };