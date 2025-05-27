import { Result } from "@/lib/result";
import { AddPaperResponse, GetAllPapersResult, PaperEntry, RetrieveResult } from "../entities/paper";

export interface PaperService {
    fetchAllPapers(): Promise<Result<GetAllPapersResult>>
    addPaper(paper: PaperEntry): Promise<Result<AddPaperResponse>>
    searchSimilar(query: string): Promise<Result<RetrieveResult[]>>
}

export interface ApiPaperService {
    fetchAllPapers(): Promise<Result<GetAllPapersResult>>
    addPaper(paper: PaperEntry): Promise<Result<AddPaperResponse>>
    searchSimilar(query: string): Promise<Result<RetrieveResult[]>>
}
