import { Err, Ok, Result } from "@/lib/result";
import { ParsePdfOutput } from "@/service/entities/pdf";
import { ApiPdfService } from "@/service/interface/pdf";
import PdfParse from "pdf-parse";

export class ApiPdfRepository implements ApiPdfService {
    async extractText(file: File): Promise<Result<ParsePdfOutput>> {
        try {
            // Convert File to Buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Parse PDF metadata using PDF.js
            const pdf = await PdfParse(buffer);
            const text = pdf.text;

            return Ok({
                text
            });
        } catch (error) {
            console.error(error);
            return Err("Error parsing PDF");
        }
    }
}