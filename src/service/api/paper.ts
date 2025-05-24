import { Err, Ok, Result, transform } from "@/lib/result";
import { getAllPapers } from "@/lib/weaviate/fetch";
import { addPaper as addPaperWeaviate } from "@/lib/weaviate/insert";
import { AddPaperResponse, GetAllPapersResult } from "@/lib/weaviate/types";
import { PaperEntrySchema } from "@/types/paper";

export const fetchAllPapersApi = async (): Promise<Result<GetAllPapersResult>> => {
    return getAllPapers();
}

export const addPaperApi = async (paper: unknown): Promise<Result<AddPaperResponse>> => {
    const parsed = PaperEntrySchema.safeParse(paper);
    if (!parsed.success) {
        return Err(`Failed to parse paper: ${parsed.error.message}`);
    }
    const res = await addPaperWeaviate(parsed.data);
    return transform(res, {
        onSuccess: (data) => Ok({ id: data }),
        onError: (message) => Err(message),
    });
}