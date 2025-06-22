import { Err, Ok, Result, safeFetch, match } from "@/lib/result";
import { PaperChunk } from "@/models/chunk";
import { PaperEntry } from "@/models/paper";
import { AddPaperChunkResponse, AddPaperChunkInputSchema, FetchAllChunksResponse, FetchAllChunksResponseSchema, AddPaperChunkResponseSchema } from "@/app/api/chunk/schema";

export async function chunkPaper(paperEntry: PaperEntry, paperEntryUuid: string): Promise<Result<string[]>> {
    return safeFetch(
        "chunk paper",
        AddPaperChunkResponseSchema,
        "/api/chunk",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ paperEntry, paperEntryUuid}),
        }
    ).then(res => match(res, {
        onSuccess: (data: AddPaperChunkResponse) => Ok(data.chunkIds),
        onError: (msg: string) => Err(msg),
    }));
}
export async function fetchAllChunks(): Promise<Result<PaperChunk[]>> {
    return safeFetch(
        "all chunks",
        FetchAllChunksResponseSchema,
        "/api/chunk",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    ).then(res => match(res, {
        onSuccess: (data: FetchAllChunksResponse) => Ok(data.chunks),
        onError: (msg: string) => Err(msg),
    }));
}