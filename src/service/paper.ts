import { Err, Ok, Result, safeFetch, match } from "@/lib/result";
import { AddPaperResponse, AddPaperResponseSchema, extractMessage, GetAllPapersResult, GetAllPapersResultSchema } from "@/storage/types";
import { PaperEntry, PaperChunk, PaperChunkSchema } from "@/types/paper";
import { z } from "zod";

export const fetchAllPapers = async (): Promise<Result<GetAllPapersResult>> => {
    return safeFetch(
        "all papers",
        GetAllPapersResultSchema,
        "/api/weaviate/paper",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    )
}

export const addPaper = async(paper: PaperEntry): Promise<Result<AddPaperResponse>> => {
    return safeFetch(
        "add paper",
        AddPaperResponseSchema,
        "/api/weaviate/paper",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paper),
        }
    )
}

export const chunkPaper = async(paperEntry: PaperEntry, paperEntryUuid: string): Promise<Result<string[]>> => {
    return safeFetch(
        "chunk paper",
        z.object({ chunks: z.array(z.string()) }),
        "/api/weaviate/paper/chunk",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ paperEntry, paperEntryUuid }),
        }
    ).then(res => match(res, {
        onSuccess: (data: { chunks: string[] }) => Ok(data.chunks),
        onError: (msg: string) => Err(msg),
    }));
}

export const fetchAllChunks = async (): Promise<Result<PaperChunk[]>> => {
    return safeFetch(
        "all chunks",
        z.array(PaperChunkSchema),
        "/api/weaviate/paper/chunk",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}