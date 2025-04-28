import { NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR, } from '@/lib/utils/dirs';
import { getFileBlob } from '@/lib/utils/globalData';
import { getBlobOrTarUrl,getUploadUrl } from '@/lib/utils';
import { getHash } from '@/lib/utils';
import { createServerSearchParamsForServerPage } from 'next/dist/server/request/search-params';
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

  const hash = filepath;
  const blobInfo = getFileBlob(hash)
  

  if(blobInfo == null){
      // 1. 检查 /public/uploads
    const uploadsPath = path.join(UPLOAD_DIR, decodedFilePath);
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
        console.log("not found decodedFilePath");
        return NextResponse.json(
          {message:`not found file ${decodedFilePath}`},
          { status: 400 }
        );
        console.error('fail to find file of :',uploadsPath);
   }
  }
  
  const blobUrl = getBlobOrTarUrl(request,blobInfo);
  console.log("images/hash => blobUrl", blobUrl);


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