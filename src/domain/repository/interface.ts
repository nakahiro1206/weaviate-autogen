import { Result } from "@/lib/result";
import { PaperChunk } from "../../domain/entities/chunk";
import { AddPaperResponse, GetAllPapersResult, PaperEntry, RetrieveResult } from "../../domain/entities/paper";
import { ParsePdfOutput } from "../../domain/entities/pdf";

export interface ChunkRepository {
    chunkPaper(paperEntry: PaperEntry, paperEntryUuid: string): Promise<Result<string[]>>
    fetchAllChunks(): Promise<Result<PaperChunk[]>>
}

export interface ApiChunkRepository {
    fetchAllChunks(): Promise<Result<PaperChunk[]>>
    chunkPaper(paperEntry: PaperEntry, paperEntryUuid: string): Promise<Result<string[]>>
}


export interface PaperRepository {
    fetchAllPapers(): Promise<Result<GetAllPapersResult>>
    addPaper(paper: PaperEntry): Promise<Result<AddPaperResponse>>
    searchSimilar(query: string): Promise<Result<RetrieveResult[]>>
}

export interface ApiPaperRepository {
    fetchAllPapers(): Promise<Result<GetAllPapersResult>>
    addPaper(paper: PaperEntry): Promise<Result<AddPaperResponse>>
    searchSimilar(query: string): Promise<Result<RetrieveResult[]>>
}


export interface ApiPdfRepository {
    extractText(file: File): Promise<Result<ParsePdfOutput>>
}

export interface PdfRepository {
    extractText(file: File): Promise<Result<ParsePdfOutput>>
}
