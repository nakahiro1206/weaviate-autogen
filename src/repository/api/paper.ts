import { Err, Ok, Result, transform } from "@/lib/result";
import { AddPaperResponse, GetAllPapersResult, RetrieveResult } from "@/service/entities/paper";
import { ApiPaperService } from "@/service/interface/paper";
import { PaperEntry } from "@/service/entities/paper";
import { getAllPapers } from "@/lib/weaviate/fetch";
import { addPaper as addPaperWeaviate } from "@/lib/weaviate/insert";
import { searchSimilar } from "@/lib/weaviate/similarity-search";


export class ApiPaperRepository implements ApiPaperService {
    async fetchAllPapers(): Promise<Result<GetAllPapersResult>> {
        return getAllPapers();
    }

    async addPaper(paper: PaperEntry): Promise<Result<AddPaperResponse>> {
        const res = await addPaperWeaviate(paper);
        return transform(res, {
            onSuccess: (data) => Ok({ id: data }),
            onError: (message) => Err(message),
        });
    }

    async searchSimilar(query: string): Promise<Result<RetrieveResult[]>> {
        return searchSimilar(query);
    }
}