import { Result, safeFetch } from "@/lib/result";
import { AddPaperResponse, AddPaperResponseSchema, GetAllPapersResult, GetAllPapersResultSchema, RetrieveResult, RetrieveResultArraySchema, RetrieveResultSchema } from "@/domain/entities/paper";
import { PaperRepository } from "./interface";
import { PaperEntry } from "@/domain/entities/paper";

export class PaperRepositoryImpl implements PaperRepository {
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
