import { Err, Ok, Result } from "@/lib/result";
import { ParsePdfOutput } from "@/domain/entities/pdf";
import PdfParse from "pdf-parse";
import { ApiPdfRepository } from "../interface";

export class ApiPdfRepositoryImpl implements ApiPdfRepository {
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