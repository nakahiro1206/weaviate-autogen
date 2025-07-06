import { NextRequest, NextResponse } from "next/server";
import { tryCatch } from "@/lib/result";
import { textStorage } from "@/lib/storage/text-storage";
import { 
  SaveTextInputSchema, 
  GetTextInputSchema, 
  DeleteTextInputSchema,
  TextListSchema 
} from "./schema";
import fs from 'fs/promises';
import path from 'path';
import { getStoragePath } from "@/config/storage";

async function getTextInfo(textId: string) {
  const contentResult = await textStorage.readText(textId);
  if (contentResult.type === "error") {
    return contentResult;
  }

  const textDir = path.join(getStoragePath(), 'texts');
  const filePath = path.join(textDir, `${textId}.txt`);
  
  try {
    const stats = await fs.stat(filePath);
    return {
      textId,
      content: contentResult.data,
      size: stats.size,
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
    };
  } catch (err) {
    return { error: `Failed to get file stats: ${err}` };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const textId = searchParams.get('textId');

  if (textId) {
    // Get specific text info
    const input = GetTextInputSchema.safeParse({ textId });
    if (!input.success) {
      return NextResponse.json({ error: "Invalid textId parameter" }, { status: 400 });
    }

    const textInfo = await getTextInfo(input.data.textId);
    if ('error' in textInfo) {
      return NextResponse.json({ error: textInfo.error }, { status: 500 });
    }

    return NextResponse.json(textInfo);
  } else {
    // List all texts
    const result = await textStorage.listTexts();
    if (result.type === "error") {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    
    const response = TextListSchema.parse({ texts: result.data });
    return NextResponse.json(response);
  }
}

export async function POST(request: NextRequest) {
  const bodyResult = tryCatch(async () => await request.json());
  if (bodyResult.type === "error") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = SaveTextInputSchema.safeParse(bodyResult.data);
  if (!input.success) {
    return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
  }

  const result = await textStorage.saveText(input.data.textId, input.data.content);
  if (result.type === "error") {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({ 
    message: "Text saved successfully", 
    textId: input.data.textId,
    filePath: result.data
  });
}

export async function DELETE(request: NextRequest) {
  const bodyResult = tryCatch(async () => await request.json());
  if (bodyResult.type === "error") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = DeleteTextInputSchema.safeParse(bodyResult.data);
  if (!input.success) {
    return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
  }

  const result = await textStorage.deleteText(input.data.textId);
  if (result.type === "error") {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({ 
    message: "Text deleted successfully", 
    textId: input.data.textId 
  });
} 