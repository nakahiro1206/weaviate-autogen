import { Result } from "@/lib/result";
import { PaperChunk } from "@/domain/entities/chunk";
import { PaperEntry } from "@/domain/entities/paper";
import { getAllChunks, addPaperChunk } from "@/lib/weaviate/insert";
import { ApiChunkRepository } from "../interface";

export class ApiChunkRepositoryImpl implements ApiChunkRepository {
    async fetchAllChunks(): Promise<Result<PaperChunk[]>> {
        return getAllChunks();
    }
    async chunkPaper(paperEntry: PaperEntry, paperEntryUuid: string): Promise<Result<string[]>> {
        return addPaperChunk(paperEntry, paperEntryUuid);
    }
}