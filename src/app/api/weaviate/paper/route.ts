import { NextResponse } from "next/server";
import { addPaperApi, fetchAllPapersApi } from "@/service/api/paper";
import { match } from "@/lib/result";

export async function GET(req: Request) {
  const res = await fetchAllPapersApi();
  switch (res.type) {
    case "success":
      return NextResponse.json(res.data);
    case "error":
      return NextResponse.json({ error: res.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const res = await addPaperApi(await req.json());
  return match<{ id: string }, NextResponse>(res, {
    onSuccess: (data) => NextResponse.json(data),
    onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
  });
}