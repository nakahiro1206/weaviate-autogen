import { Result } from "@/lib/result";
import { AddPaperResponse, GetAllPapersResult, PaperEntry } from "../entities/paper";

export interface PaperService {
    fetchAllPapers(): Promise<Result<GetAllPapersResult>>
    addPaper(paper: PaperEntry): Promise<Result<AddPaperResponse>>
}

export interface ApiPaperService {
    fetchAllPapers(): Promise<Result<GetAllPapersResult>>
    addPaper(paper: PaperEntry): Promise<Result<AddPaperResponse>>
}
