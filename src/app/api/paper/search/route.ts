import { NextRequest, NextResponse } from "next/server";
import { SearchSimilarResponse, SearchSimilarInputSchema } from "./schema";
import { searchSimilar } from "@/lib/weaviate/similarity-search";
import { RetrievedPaperEntry } from "@/models/paper";
import { match } from "@/lib/result";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = SearchSimilarInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const res = await searchSimilar(parsed.data.query);
  return match<RetrievedPaperEntry[], NextResponse>(res, {
    onSuccess: (data) => {
      const res: SearchSimilarResponse = { results: data };
      return NextResponse.json(res);
    },
    onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
  });
}