import { NextRequest, NextResponse } from "next/server";
import { tryCatch } from "@/lib/result";
import { textStorage } from "@/lib/storage/text-storage";
import { 
  SaveTextInputSchema, 
} from "./schema";
import fs from 'fs/promises';
import path from 'path';
import { getStoragePath } from "@/config/storage";
import { Err, Ok, Result } from "@/lib/result";
import { TextInfo } from "./schema";

async function getTextInfo(textId: string): Promise<Result<TextInfo>> {
  const contentResult = await textStorage.readText(textId);
  if (contentResult.type === "error") {
    return contentResult;
  }

  const textDir = path.join(getStoragePath(), 'texts');
  const filePath = path.join(textDir, `${textId}.txt`);
  
  try {
    const stats = await fs.stat(filePath);
    return Ok({
      textId,
      content: contentResult.data,
      size: stats.size,
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
    });
  } catch (err) {
    return Err(`Failed to get file stats: ${err}`);
  }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;

    const textInfoResult = await getTextInfo(id);
    if (textInfoResult.type === "error") {
        return NextResponse.json({ error: textInfoResult.message }, { status: 500 });
    }

    return NextResponse.json<TextInfo>(textInfoResult.data);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  const bodyResult = tryCatch(async () => await request.json());
  if (bodyResult.type === "error") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = SaveTextInputSchema.safeParse(bodyResult.data);
  if (!input.success) {
    return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
  }

  const result = await textStorage.saveText(id, input.data.content);
  if (result.type === "error") {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({ 
    message: "Text saved successfully", 
    textId: id,
    filePath: result.data
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  const result = await textStorage.deleteText(id);
  if (result.type === "error") {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({ 
    message: "Text deleted successfully", 
    textId: id 
  });
} 