import { Result, safeFetch } from "@/lib/result";
import { ParsePdfOutput, ParsePdfOutputSchema } from "@/domain/entities/pdf";
import { PdfRepository } from "./interface";

export class PdfRepositoryImpl implements PdfRepository {
    async extractText(file: File): Promise<Result<ParsePdfOutput>> {
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
}
