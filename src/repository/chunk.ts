import { Err, Ok, Result, safeFetch, match } from "@/lib/result";
import { PaperChunk, ChunkResultSchema, PaperChunksSchema } from "@/service/entities/chunk";
import { PaperEntry } from "@/service/entities/paper";
import { ChunkService } from "@/service/interface/chunk";

export class ChunkRepository implements ChunkService {
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
                body: JSON.stringify({ paperEntry, paperEntryUuid }),
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
