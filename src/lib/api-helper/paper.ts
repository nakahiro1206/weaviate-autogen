import { Err, match, Ok, Result, safeFetch } from "@/lib/result"
import { AddPaperRequest, AddPaperResponse, AddPaperResponseSchema, GetAllPapersResponse, GetAllPapersResponseSchema } from "@/app/api/paper/schema"
import { PaperEntry } from "@/models/paper"
import { RetrievedPaperEntry } from "@/models/paper"
import { SearchSimilarResponse, SearchSimilarResponseSchema } from "@/app/api/paper/search/schema"

export async function fetchAllPapers(): Promise<Result<RetrievedPaperEntry[]>> {
    return safeFetch(
        "all papers",
        GetAllPapersResponseSchema,
        "/api/paper",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    ).then(res => match(res, {
        onSuccess: (data: GetAllPapersResponse) => Ok(data.papers),
        onError: (msg: string) => Err(msg),
    }));
}
export async function addPaper(paper: AddPaperRequest): Promise<Result<AddPaperResponse>> {
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
export async function searchSimilar(query: string): Promise<Result<RetrievedPaperEntry[]>> {
    return safeFetch(
        "search similar",
        SearchSimilarResponseSchema,
        "/api/paper/search",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        }
    ).then(res => match(res, {
        onSuccess: (data: SearchSimilarResponse) => Ok(data.results),
        onError: (msg: string) => Err(msg),
    }));
}