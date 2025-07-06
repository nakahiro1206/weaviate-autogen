import { NextRequest, NextResponse } from 'next/server';
import { FileStorage } from '@/lib/storage/file-storage';
import { getStoragePath } from '@/config/storage';

const fileStorage = new FileStorage(getStoragePath());

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const result = await fileStorage.readFile(id);
    if (result.type === 'error') {
      return new NextResponse('PDF not found', { status: 404 });
    }

    return new NextResponse(result.data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 