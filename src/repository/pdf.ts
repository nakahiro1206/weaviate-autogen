import { Result, safeFetch } from "@/lib/result";
import { ParsePdfOutput, ParsePdfOutputSchema } from "@/service/entities/pdf";
import { PdfService } from "@/service/interface/pdf";

export class PdfRepository implements PdfService {
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
