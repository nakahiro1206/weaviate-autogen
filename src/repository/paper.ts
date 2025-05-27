import { Result, safeFetch } from "@/lib/result";
import { AddPaperResponse, AddPaperResponseSchema, GetAllPapersResult, GetAllPapersResultSchema, RetrieveResult, RetrieveResultArraySchema, RetrieveResultSchema } from "@/service/entities/paper";
import { PaperService } from "@/service/interface/paper";
import { PaperEntry } from "@/service/entities/paper";

export class PaperRepository implements PaperService {
    async fetchAllPapers(): Promise<Result<GetAllPapersResult>> {
        return safeFetch(
            "all papers",
            GetAllPapersResultSchema,
            "/api/paper",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
    }
    async addPaper(paper: PaperEntry): Promise<Result<AddPaperResponse>> {
        return safeFetch(
            "add paper",
            AddPaperResponseSchema,
            "/api/paper",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paper),
            }
        )
    }
    async searchSimilar(query: string): Promise<Result<RetrieveResult[]>> {
        return safeFetch(
            "search similar",
            RetrieveResultArraySchema,
            "/api/paper/search",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            }
        )
    }
}
