"use server";
import { NextResponse } from "next/server";
import { match, Ok, Result, tryCatch } from "@/lib/result";
import { ParsePdfOutput } from "./schema";
import PdfParse from "pdf-parse";

async function extractText(file: File): Promise<Result<ParsePdfOutput>> {
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Parse PDF metadata using PDF.js
  const pdf = await PdfParse(buffer);
  const text = pdf.text;

  return Ok({
    text
  })
}

export async function POST(req: Request) {
  const formDataResult = tryCatch(async () => await req.formData())
  if (formDataResult.type === "error") {
    return NextResponse.json({ error: "body is not a form data" }, { status: 400 });
  }
  const formData = await formDataResult.data
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file is not a file" }, { status: 400 });
  }
  const res = await extractText(file);
  return match<ParsePdfOutput, NextResponse>(res, {
    onSuccess: (data) => {
      const res: ParsePdfOutput = data;
      return NextResponse.json(res);
    },
    onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
  });
}
