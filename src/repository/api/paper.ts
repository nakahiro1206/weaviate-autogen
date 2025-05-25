import { Err, Ok, Result, transform } from "@/lib/result";
import { AddPaperResponse, GetAllPapersResult } from "@/service/entities/paper";
import { ApiPaperService } from "@/service/interface/paper";
import { PaperEntry } from "@/service/entities/paper";
import { getAllPapers } from "@/lib/weaviate/fetch";
import { addPaper as addPaperWeaviate } from "@/lib/weaviate/insert";


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
}