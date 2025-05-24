import { Result, safeFetch } from "@/lib/result";
import { ParsePdfOutput, ParsePdfOutputSchema } from "@/types/parse-pdf";

export const parsePdf = async (
  file: File,
): Promise<Result<ParsePdfOutput>> => {
  const formData = new FormData();
  formData.append("file", file);
  return safeFetch(
    "parse pdf",
    ParsePdfOutputSchema,
    "/api/parse-pdf",
    {
      method: "POST",
      body: formData,
    }
  )
};
