import path from 'path';
import { promises as fsp } from 'fs';
import fs from 'fs';
import { createReadStream } from 'fs';
import { NextRequest } from 'next/server';
import { getBlobInfoFromDB } from '@/lib/utils/db'; // 假设存在一个函数从数据库获取 blob 信息
import { NextResponse } from 'next/server';
import { UPLOAD_DIR,getUploadFile } from '@/lib/utils/dirs';

export async function GET(request: NextRequest /**, { params }: { params: { blobId: string } } */) {
  let blobId = request.nextUrl.searchParams.get('blobId') || '';
  const imagePath = getUploadFile(blobId);
  try {
    // 检查文件是否存在
    await fs.promises.access(imagePath);
    
    // 创建可读流
    const imageStream = fs.createReadStream(imagePath);
    
    // 返回流式响应
    return new NextResponse(imageStream as any, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable' // 长期缓存
      }
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
