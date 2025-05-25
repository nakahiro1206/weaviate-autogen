import { NextResponse } from "next/server";
import { match, tryCatch } from "@/lib/result";
import { PaperEntrySchema } from "@/service/entities/paper";
import { apiPaperService } from "../service";

export async function GET(req: Request) {
  const res = await apiPaperService.fetchAllPapers();
  switch (res.type) {
    case "success":
      return NextResponse.json(res.data);
    case "error":
      return NextResponse.json({ error: res.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const bodyResult = tryCatch(async () => await req.json());
  if (bodyResult.type === "error") {
    return NextResponse.json({ error: "body is not a json" }, { status: 400 });
  }
  const body = await bodyResult.data;
  const parsed = PaperEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const res = await apiPaperService.addPaper(parsed.data);
  return match<{ id: string }, NextResponse>(res, {
    onSuccess: (data) => NextResponse.json(data),
    onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
  });
}