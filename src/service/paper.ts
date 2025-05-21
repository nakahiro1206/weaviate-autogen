import { Err, Ok, Result } from "@/lib/result";
import { getAllPapers } from "@/lib/weaviate-client/fetch";
import { addPaper as addPaperWeaviate } from "@/lib/weaviate-client/insert";
import { AddPaperInput, AddPaperResponse, extractMessage, GetAllPapersResult, GetAllPapersResultSchema } from "@/lib/weaviate-client/types";
import { PaperEntry, PaperEntrySchema } from "@/types/paper";

export const fetchAllPapersApi = async (): Promise<Result<GetAllPapersResult>> => {
    return getAllPapers();
}

export const fetchAllPapers = async (): Promise<Result<GetAllPapersResult>> => {
    try {
        const res = await fetch("/api/weaviate/paper", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        if (!res.ok) {
            return Err(`Failed to fetch all papers: ${res.statusText}`);
        }
        const data = await res.json();
        const parsed = GetAllPapersResultSchema.safeParse(data);
        if (!parsed.success) {
            const msg = parsed.error.errors.map(e => e.message).join("\n");
            return Err(`Failed to parse all papers: ${msg}`);
        }
        return Ok(parsed.data);
    } catch (err) {
        return Err(`Failed to fetch all papers: ${extractMessage(err)}`);
    }
}

export const addPaperApi = async (paper: unknown): Promise<Result<string>> => {
    const parsed = PaperEntrySchema.safeParse(paper);
    if (!parsed.success) {
        return Err(`Failed to parse paper: ${parsed.error.message}`);
    }
    const res = await addPaperWeaviate(parsed.data);
    return res;
}

export const addPaper = async(paper: PaperEntry): Promise<Result<string>> => {
    try {
        const res = await fetch("/api/weaviate/paper", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paper),
        })
        if (!res.ok) {
            return Err(`Failed to add paper: ${res.statusText}`);
        }
        const data = await res.json();
        return Ok(data.id);
    } catch (err) {
        return Err(`Failed to add paper: ${extractMessage(err)}`);
    }
}