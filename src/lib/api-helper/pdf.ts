import { Result, safeFetch } from "@/lib/result";
import { ParsePdfOutput, ParsePdfOutputSchema } from "@/app/api/pdf/schema";

export async function extractText(file: File): Promise<Result<ParsePdfOutput>> {
    const formData = new FormData();
    formData.append("file", file);
    return safeFetch(
        "parse pdf",
        ParsePdfOutputSchema,
        "/api/pdf",
        {
        method: "POST",
        body: formData,
        }
    )
}