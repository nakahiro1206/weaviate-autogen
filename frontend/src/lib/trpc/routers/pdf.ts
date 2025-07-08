import { Ok, Result } from "@/lib/result";
import { procedure, router } from "@/lib/trpc/server";
import PdfParse from "pdf-parse";
import { zfd } from "zod-form-data";

// (node:36281) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
async function extractText(file: File): Promise<Result<string>> {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
  
    // Parse PDF metadata using PDF.js
    const pdf = await PdfParse(buffer);
    const text = pdf.text;
  
    return Ok(text)
  }

export const pdfRouter = router({
    extractText: procedure.input(zfd.formData({
        file: zfd.file(),
    })).mutation(async ({ input }) => {
        const { file } = input;
        const result = await extractText(file);
        return result;
    }),
})