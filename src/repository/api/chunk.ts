import { Result } from "@/lib/result";
import { PaperChunk } from "@/service/entities/chunk";
import { PaperEntry } from "@/service/entities/paper";
import { ApiChunkService } from "@/service/interface/chunk";
import { getAllChunks, addPaperChunk } from "@/lib/weaviate/insert";

export class ApiChunkRepository implements ApiChunkService {
    async fetchAllChunks(): Promise<Result<PaperChunk[]>> {
        return getAllChunks();
    }
    async chunkPaper(paperEntry: PaperEntry, paperEntryUuid: string): Promise<Result<string[]>> {
        return addPaperChunk(paperEntry, paperEntryUuid);
    }
}