import {getBlobInfoFromDB , readBlob} from '@/lib/utils/db'
import { NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR,getUploadUrl } from '@/lib/utils/dirs';
import { getBlobInfo } from '@/lib/utils/globalData';
import { getBlobRequestUrl } from '@/lib/utils/db';

// 缓存文件存在性检查结果（可选）
const fileExistenceCache = new Map<string, boolean>();
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

  const blobInfo = getBlobInfo(filepath)
  const blobUrl = getBlobRequestUrl(request,blobInfo);


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