import { Result } from "@/lib/result";
import { PaperChunk } from "../entities/chunk";
import { PaperEntry } from "../entities/paper";

export interface ChunkService {
    chunkPaper(paperEntry: PaperEntry, paperEntryUuid: string): Promise<Result<string[]>>
    fetchAllChunks(): Promise<Result<PaperChunk[]>>
}

export interface ApiChunkService {
    fetchAllChunks(): Promise<Result<PaperChunk[]>>
    chunkPaper(paperEntry: PaperEntry, paperEntryUuid: string): Promise<Result<string[]>>
}