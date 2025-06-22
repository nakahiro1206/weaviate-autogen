import { getPaperCollection } from "./client";
import { Ok, Err, Result } from "@/lib/result";
import { PaperEntrySchema, RetrievedPaperEntry } from "@/models/paper";

export const getAllPapers = async (): Promise<Result<RetrievedPaperEntry[]>> => {
    try {
      console.log("start");
      const paperCollection = await getPaperCollection();
      console.log("aaa");
      const iter = paperCollection.iterator();
      const res: RetrievedPaperEntry[] = [];
      for await (const item of iter) {
        const parsed = PaperEntrySchema.safeParse(item.properties);
        if (!parsed.success) {
          console.error(`Failed to parse paper: ${parsed.error}`);
          continue;
        }
        res.push({...parsed.data, metadata: {uuid: item.uuid}})
      }
      return Ok(res);
    } catch (err) {
      console.error(err);
      console.log(process.env["OPENAI_API_KEY"]);
      return Err(`Failed to get all papers: ${err}`);
    }
  };