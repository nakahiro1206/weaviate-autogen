import { Err, Ok, Result, safeFetch, match } from "@/lib/result";
import { PaperChunk, ChunkResultSchema, PaperChunksSchema } from "@/domain/entities/chunk";
import { PaperEntry } from "@/domain/entities/paper";
import { ChunkRepository } from "./interface";

export class ChunkRepositoryImpl implements ChunkRepository {
    async chunkPaper(paperEntry: PaperEntry, paperEntryUuid: string): Promise<Result<string[]>> {
        return safeFetch(
            "chunk paper",
            ChunkResultSchema,
            "/api/chunk",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ paperEntry, paperEntryUuid}),
            }
        ).then(res => match(res, {
            onSuccess: (data: { chunks: string[] }) => Ok(data.chunks),
            onError: (msg: string) => Err(msg),
        }));
    }
    async fetchAllChunks(): Promise<Result<PaperChunk[]>> {
        return safeFetch(
            "all chunks",
            PaperChunksSchema,
            "/api/chunk",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
}
