import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import tar from 'tar-stream';
import { getTarFile } from '@/lib/utils/dirs';
import { saveBlobInfoToDB } from '@/lib/utils/db';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { contentTypeToString } from '@/lib/utils/content';
type Context = {
    params: Promise<{
      blobId: string;
    }>;
  };

async function readFileRange(
    filePath: string,
    start: number,
    end: number
  ): Promise<Buffer | null> {
    try {
      const fileHandle = await fs.open(filePath, 'r');
      const buffer = Buffer.alloc(end - start);
      
      const { bytesRead } = await fileHandle.read(
        buffer, 
        0, 
        buffer.length, 
        start
      );
      
      await fileHandle.close();
      
      // 如果实际读取的字节数小于请求的字节数，返回实际读取的部分
      return bytesRead < buffer.length ? buffer.slice(0, bytesRead) : buffer;
    } catch (error) {
      console.error(`Error reading file range: ${error}`);
      return null;
    }
  }
// 假设 tar 包存储在本地的某个路径

export async function GET(request: NextRequest, context : Context ) {
    let blobId = (await context.params).blobId;
    let searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const contentType = Number(searchParams.get("contentType") );
    const mimeType = contentTypeToString(contentType);
    if(!start || !end){
        return NextResponse.json({message:"invalid arg of start:${start},end =${end} "},{status:400});
    }
    const startRange = parseInt(start, 10);
    const endRange = parseInt(end, 10);

    if (isNaN(startRange) || isNaN(endRange)) {
        return NextResponse.json({ message: 'Invalid range parameters' }, { status: 400 });
    }

    let tarPath = getTarFile(blobId);

    try {
        const range = {
            start: startRange,
            end: endRange , // 注意这里 end 是包含的，所以要减 1
        }
        const stream = createReadStream(tarPath,range);
        //console.log("create stream file and range", tarPath,range);
        const readable : ReadableStream = Readable.toWeb(stream) as ReadableStream;
        return new NextResponse(readable, {
            headers: {
                'Content-Type': mimeType, // 根据实际图片类型修改
            },
        });
        // let buffer = await readFileRange(tarPath,startRange,endRange);
        // console.log(buffer);

        // if(buffer){
        //     return new NextResponse(buffer, {
        //             headers: {
        //                 'Content-Type': mimeType, // 根据实际图片类型修改
        //             },
        //         });
        // } else{
        //     return NextResponse.json({ message: 'read buffer failed' }, { status: 500 });
        // }
    } catch (error) {
        console.error('Error reading tar file:', error);
        return NextResponse.json({ message: 'Error reading tar file' }, { status: 500 });
    }
}
    