"use server";

import { Err, Ok, Result } from "@/lib/result";
import { ParsePdfOutput } from "@/types/parse-pdf";
import PdfParse from "pdf-parse";

export const parsePdf = async (formData: FormData): Promise<Result<ParsePdfOutput>> => {
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
        return Err("No file provided or invalid file type");
    }

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
};