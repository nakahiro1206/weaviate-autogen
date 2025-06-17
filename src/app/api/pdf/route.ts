"use server";
import { NextResponse } from "next/server";
import { match, tryCatch } from "@/lib/result";
import { ParsePdfOutput } from "@/domain/entities/pdf";
import { apiPdfUseCase } from "../service";

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
  const res = await apiPdfUseCase.extractText(file);
  return match<ParsePdfOutput, NextResponse>(res, {
    onSuccess: (data) => NextResponse.json(data),
    onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
  });
}
