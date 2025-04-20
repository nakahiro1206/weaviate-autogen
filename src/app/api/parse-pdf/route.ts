"use server";
import PdfParse from "@/pdf-parse";
import { NextResponse } from "next/server";
import pdfToText from "react-pdftotext";

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    console.log(formData);
    const file = formData.get("file") as File;
    console.log(file, formData);

    // body size, PDF validation
    // Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse PDF metadata using PDF.js
    const pdf = await PdfParse(buffer);
    const text = pdf.text;

    // const text = await pdfToText(file);

    return NextResponse.json(
      {
        __typename: "ParsePdfOutput",
        text,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        __typename: "Err",
        message: "Error parsing PDF",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
