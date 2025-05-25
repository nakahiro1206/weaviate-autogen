import { Result } from "@/lib/result";
import { ParsePdfOutput } from "../entities/pdf";

export interface ApiPdfService {
    extractText(file: File): Promise<Result<ParsePdfOutput>>
}

export interface PdfService {
    extractText(file: File): Promise<Result<ParsePdfOutput>>
}
