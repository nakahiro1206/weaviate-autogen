import { apiPaperService } from "@/app/api/service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const InputSchema = z.object({
  query: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const res = await apiPaperService.searchSimilar(parsed.data.query);
  switch (res.type) {
    case "success":
      return NextResponse.json(res.data);
    case "error":
      return NextResponse.json({ error: res.message }, { status: 500 });
  }
}