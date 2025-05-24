import { Err, Ok, Result, transform } from "@/lib/result";
import { getAllPapers } from "@/storage/fetch";
import { addPaper as addPaperWeaviate } from "@/storage/insert";
import { AddPaperResponse, GetAllPapersResult } from "@/storage/types";
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