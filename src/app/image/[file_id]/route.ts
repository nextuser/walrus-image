import { NextResponse } from 'next/server';
import path from 'path';
import { UPLOAD_DIR, } from '@/lib/utils/dirs';
import { getHash } from '@/lib/utils';
import { createServerSearchParamsForServerPage } from 'next/dist/server/request/search-params';
import { logger } from '@/lib/utils/logger';
import { getBlobUrl, getServerTusky } from '@/lib/tusky/tusky_server';
type Context = {
  params: Promise<{
    file_id: string;
  }>;
};

export async function GET(
  request: Request,
  context : Context 
) {
  const file_id  = (await context.params).file_id;
  

  if(!file_id){
    return NextResponse.json({message:'invalid arg of file_id'}, {status:401})
  }
  
  const tusky = getServerTusky();
  console.log("tusky.file.get : image/",file_id);
  const file = await tusky.file.get(file_id) 
  console.log(`image/id  file blobId=|${file.blobId}| typeof blobId`,(typeof file.blobId));
  if(!file.blobId || file.blobId == 'unknown'){
    const arrayBuffer = await tusky.file.arrayBuffer(file_id)
    const buffer = Buffer.from(arrayBuffer)
    console.log('buffer length',buffer.length);  
    
    // 设置响应头
    const headers = {
      'Content-Type': file.mimeType, // 根据文件类型设置合适的 Content-Type
      //'Content-Length': String(buffer.byteLength),
    };

    console.log('image headers of', file_id, headers);

    // 返回 Buffer 作为响应体
    return new NextResponse(buffer, { headers });
  } else {
    const blobUrl = getBlobUrl(file.blobId);
    console.error(`redirect: blobId=${file.blobId},  blobUrl=${blobUrl}.`)
    // 1. 检查 /public/uploads
    return  NextResponse.redirect(
      new URL( blobUrl, request.url),
      { 
        status: 301,
        headers: {
          'Cache-Control': 'public, max-age=3600' // 1小时缓存
        }
      }
    );
  } 
   
}