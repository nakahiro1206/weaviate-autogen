import { NextRequest, NextResponse } from 'next/server';
import { FileStorage } from '@/lib/storage/file-storage';
import { getStoragePath } from '@/config/storage';

const fileStorage = new FileStorage(getStoragePath());

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await fileStorage.readFile(params.id);
    if (result.type === 'error') {
      return new NextResponse('PDF not found', { status: 404 });
    }

    return new NextResponse(result.data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${params.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 