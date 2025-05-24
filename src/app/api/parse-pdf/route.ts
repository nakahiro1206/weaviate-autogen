"use server";
import { NextResponse } from "next/server";
import { parsePdf as parsePdfApi } from "@/service/api/parse-pdf";
import { match } from "@/lib/result";
import { ParsePdfOutput } from "@/types/parse-pdf";

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const res = await parsePdfApi(formData);
    return match<ParsePdfOutput, NextResponse>(res, {
      onSuccess: (data) => NextResponse.json(data),
      onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
    });
  } catch (error) {
    return NextResponse.json({ error: "input body should be a form data" }, { status: 400 });
  }
}
