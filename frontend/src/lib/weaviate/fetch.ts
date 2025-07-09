import { getPaperChunkCollection, getPaperCollection } from "./client";
import { Ok, Err, Result } from "@/lib/result";
import { RetrievedPaperChunk, PaperChunkSchema } from "@/models/chunk";
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

export const getPapersWithLimit = async (limit: number = 20): Promise<Result<RetrievedPaperEntry[]>> => {
  try {
    const paperCollection = await getPaperCollection();
    const iter = paperCollection.iterator();
    const res: RetrievedPaperEntry[] = [];
    for await (const item of iter) {
      const parsed = PaperEntrySchema.safeParse(item.properties);
      if (!parsed.success) {
        console.error(`Failed to parse paper: ${parsed.error}`);
        continue;
      }
      res.push({...parsed.data, metadata: {uuid: item.uuid}});
      if (res.length >= limit) {
        break;
      }
    }
    return Ok(res);
  } catch (err) {
    console.error(err);
    return Err(`Failed to get papers with limit: ${err}`);
  } 
}

export const getPaperById = async (id: string): Promise<Result<RetrievedPaperEntry>> => {
  try {
    const paperCollection = await getPaperCollection();
    const response = await paperCollection.query.fetchObjectById(id)
    if (response) {
        const parsed = PaperEntrySchema.safeParse(response.properties);
        if (!parsed.success) {
          return Err(`Failed to parse paper: ${parsed.error}`);
        }
        return Ok({...parsed.data, metadata: {uuid: response.uuid}});
      }
    return Err(`Paper with id ${id} not found`);
  } catch (err) {
    console.error(err);
    return Err(`Failed to get paper by id: ${err}`);
  }
}

export const getPaperChunksByPaperIdWithLimit = async (paperEntryUuid: string, limit: number = 20): Promise<Result<RetrievedPaperChunk[]>> => {
  try {
    const paperChunkCollection = await getPaperChunkCollection();
    const result = await paperChunkCollection.query.fetchObjects({
      limit: limit,
      filters: paperChunkCollection.filter.byProperty('paperId').equal(paperEntryUuid),
    })
    const res: RetrievedPaperChunk[] = [];
    for (let object of result.objects) {
      const parsed = PaperChunkSchema.safeParse(object.properties);
      if (!parsed.success) {
        console.error(`Failed to parse paper chunk: ${parsed.error}`);
        continue;
      }
      res.push({...parsed.data, metadata: {uuid: object.uuid}});
    }
    return Ok(res);
  } catch (err) {
    console.error(err);
    return Err(`Failed to get paper chunks with limit: ${err}`);
  }
}

export const isPaperChunkIndexed = async (paperEntryUuid: string): Promise<Result<boolean>> => {
  try {
    const paperChunkCollection = await getPaperChunkCollection();
    const result = await paperChunkCollection.query.fetchObjects({
      limit: 1,
      filters: paperChunkCollection.filter.byProperty('paperId').equal(paperEntryUuid),
    })

    if (result.objects.length > 0) {
        return Ok(true);
    }
    return Ok(false);
  } catch (err) {
    return Err(`Failed to check if paper chunk is indexed: ${err}`);
  }
  }