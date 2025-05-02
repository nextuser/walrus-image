import { NextRequest, NextResponse } from 'next/server';
import { getTarFile, getUploadFile } from '@/lib/utils/dirs';
import fs from '@/lib/imagefs';
import { Readable } from 'stream';
import { getContentTypeByExtType, getMimeTypeByContentType } from '@/lib/utils/content';
import { getExt } from '@/lib/utils';
type Context = {
    params: Promise<{
      filepath: string;
    }>;
  };



export async function GET(request: NextRequest, context : Context ) {
    let filepath = (await context.params).filepath;
    let extType = getExt(filepath)
    const contentType = getContentTypeByExtType(extType);
    const mimeType = getMimeTypeByContentType(contentType);

   
    try {
        const stream = fs.createReadStream(getUploadFile(filepath));
        //console.log("create stream file and range", tarPath,range);
        const readable : ReadableStream = Readable.toWeb(stream) as ReadableStream;
        return new NextResponse(readable, {
            headers: {
                'Content-Type': mimeType, // 根据实际图片类型修改
            },
        });

    } catch (error) {
        console.error('Error reading tar file:', error);
        return NextResponse.json({ message: 'Error reading tar file' }, { status: 500 });
    }
}
    