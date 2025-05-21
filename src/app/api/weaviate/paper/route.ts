import { NextResponse } from "next/server";
import { addPaperApi, fetchAllPapersApi } from "@/service/paper";

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
  switch (res.type) {
    case "success":
      return NextResponse.json(res.data);
    case "error":
      return NextResponse.json({ error: res.message }, { status: 500 });
  }
}