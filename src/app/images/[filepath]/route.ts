import { NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR,getUploadUrl } from '@/lib/utils/dirs';
import { getFileBlob } from '@/lib/utils/globalData';
import { getBlobOrTarUrl ,getHash } from '@/lib/utils/db';

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
  // 1. 检查 /public/uploads
  const uploadsPath = path.join(UPLOAD_DIR, decodedFilePath);
    
  try {

    if(fs.existsSync(uploadsPath)){
      
        return NextResponse.redirect(
          new URL(getUploadUrl(encodeFileURI), request.url),
          { 
            status: 302,
          }
        );
    }
  } 
  catch (uploadError) {
      
  } 
  const hash = getHash(filepath);
 
  const blobInfo = getFileBlob(hash)
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