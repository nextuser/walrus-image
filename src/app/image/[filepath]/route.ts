import { NextResponse } from 'next/server';
import {getFs} from '@/lib/utils/globalData';
import path from 'path';
import { UPLOAD_DIR, } from '@/lib/utils/dirs';
import { getFileBlob } from '@/lib/utils/globalData';
import { getBlobOrTarUrl,getUploadUrl } from '@/lib/utils';
import { getHash } from '@/lib/utils';
import { createServerSearchParamsForServerPage } from 'next/dist/server/request/search-params';
import { logger } from '@/lib/utils/logger';
type Context = {
  params: Promise<{
    filepath: string;
  }>;
};

export async function GET(
  request: Request,
  context : Context 
) {
  const { filepath } = await context.params;
  logger.info("GET : filepath",filepath);
  const decodedFilePath = decodeURIComponent(filepath);
  const encodeFileURI = encodeURIComponent(filepath);

  const hash = getHash(decodedFilePath);
  const blobInfo = getFileBlob(hash)
  const fs = getFs();
  console.log('fs UPLOAD_DIR exists:',fs.existsSync(UPLOAD_DIR))

  if(blobInfo == null){
      // 1. 检查 /public/uploads
    const uploadsPath = path.join(UPLOAD_DIR, decodedFilePath);
    console.log("fs.existsSync uploadsPath", uploadsPath)
    if(fs.existsSync(uploadsPath)){
      
      const uploadUrl = getUploadUrl(request,encodeFileURI);
      console.log(filepath ,'=>',uploadUrl);
      return NextResponse.redirect(
          new URL(uploadUrl, request.url),
          { 
            status: 302,
          });
    } 
    else{
        console.error('not found : fs.existsSync uploadsPath:',uploadsPath);
        return NextResponse.json(
          {message:`not found file ${decodedFilePath}`},
          { status: 400 }
        );
   }
  }
  
  const blobUrl = getBlobOrTarUrl(request,blobInfo);
  console.log("image/hash.ext => blobUrl", blobUrl);


  return NextResponse.redirect(
    new URL(blobUrl, request.url),
    { 
      status: 301,
      headers: {
        'Cache-Control': 'public, max-age=3600' // 1小时缓存
      }
    }
  );
   
}