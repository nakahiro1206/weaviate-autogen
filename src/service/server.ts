import { PaperChunk } from "@/domain/entities/chunk";
import { AddPaperResponse, GetAllPapersResult, PaperEntry, RetrieveResult } from "@/domain/entities/paper";
import { ParsePdfOutput } from "@/domain/entities/pdf";
import { ChunkRepository, PaperRepository, PdfRepository } from "@/domain/repository/interface";
import { Result } from "@/lib/result";

export class ApiPaperUseCase {
    constructor(private readonly paperRepository: PaperRepository) {}

    async searchSimilar(query: string): Promise<Result<RetrieveResult[]>> {
        return this.paperRepository.searchSimilar(query);
    }

    async addPaper(paper: PaperEntry): Promise<Result<AddPaperResponse>> {
        return this.paperRepository.addPaper(paper);
    }

    async fetchAllPapers(): Promise<Result<GetAllPapersResult>> {
        return this.paperRepository.fetchAllPapers();
    }
}

export class ApiChunkUseCase {
    constructor(private readonly chunkRepository: ChunkRepository) {}

    async fetchAllChunks(): Promise<Result<PaperChunk[]>> {
        return this.chunkRepository.fetchAllChunks();
    }

    async chunkPaper(paperEntry: PaperEntry, paperEntryUuid: string): Promise<Result<string[]>> {
        return this.chunkRepository.chunkPaper(paperEntry, paperEntryUuid);
    }
}

export class ApiPdfUseCase {
    constructor(private readonly pdfRepository: PdfRepository) {}

    async extractText(file: File): Promise<Result<ParsePdfOutput>> {
        return this.pdfRepository.extractText(file);
    }
}