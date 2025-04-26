import { NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR,getUploadUrl } from '@/lib/utils/dirs';
import { getFileBlob } from '@/lib/utils/globalData';
import { getBlobOrTarUrl } from '@/lib/utils';
import { getHash } from '@/lib/utils';
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
  const decodedFilePath = decodeURIComponent(filepath);
  const encodeFileURI = encodeURIComponent(filepath);

  const hash = getHash(filepath);
  const blobInfo = getFileBlob(hash)
  
  if(blobInfo == null){
      // 1. 检查 /public/uploads
    const uploadsPath = path.join(UPLOAD_DIR, decodedFilePath);
    if(fs.existsSync(uploadsPath)){
      return NextResponse.redirect(
          new URL(getUploadUrl(encodeFileURI), request.url),
          { 
            status: 302,
          });
    } 
    else{
        return NextResponse.json(
          {message:`not found file ${decodedFilePath}`},
          { status: 400 }
        );
        console.error('fail to find file of :',uploadsPath);
   }
  }
  
  const blobUrl = getBlobOrTarUrl(request,blobInfo);
  console.log("hash:",hash, "url", "blobUrl");


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