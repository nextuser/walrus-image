import {getBlobInfoFromDB , readBlob} from '@/lib/utils/db'
import { NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import path from 'path';
import { UPLOAD_DIR,getUploadUrl } from '@/lib/utils/dirs';
import { getBlobInfo } from '@/lib/utils/globalData';

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
  try {
    const { filepath } = await context.params;
    const blobInfo = getBlobInfo(filepath)
    const decodedFilePath = decodeURIComponent(filepath);
    const encodeFileURI = encodeURIComponent(filepath);
    const cacheKey = `file:${decodedFilePath}`;
    let blobUrl = "/tar/";
    if(blobInfo){
      blobUrl +=  `${encodeURIComponent(blobInfo.blobId)}/?start=${blobInfo.range.start}&end=${blobInfo.range.end}`;
    }

    // 检查缓存（可选）
    if (fileExistenceCache.has(cacheKey)) {
      const existsInUploads = fileExistenceCache.get(cacheKey);
      const redirectPath = existsInUploads 
        ? getUploadUrl(encodeFileURI)
        : blobUrl;
      
      return NextResponse.redirect(
        new URL(redirectPath, request.url),
        { status: 302 }
      );
    }

    // 1. 检查 /public/uploads
    const uploadsPath = path.join(UPLOAD_DIR, decodedFilePath);
    
    try {
      await stat(uploadsPath);
      console.log("read file" ,uploadsPath);
      fileExistenceCache.set(cacheKey, true); // 缓存结果
      
      return NextResponse.redirect(
        new URL(getUploadUrl(encodeFileURI), request.url),
        { 
          status: 302,
          headers: {
            'Cache-Control': 'public, max-age=3600' // 1小时缓存
          }
        }
      );
    } catch (uploadError) {

      // 2. 检查 /public/blobs
      const blobsPath = path.join(process.cwd(),  'blobs', decodedFilePath);
      
      try {
        await stat(blobsPath);
        fileExistenceCache.set(cacheKey, false); // 缓存结果
        
        return NextResponse.redirect(
          new URL(`/blobs/${decodedFilePath}`, request.url),
          { 
            status: 302,
            headers: {
              'Cache-Control': 'public, max-age=3600' // 1小时缓存
            }
          }
        );
      } catch (blobError) {
        // 3. 文件不存在
        return NextResponse.json(
          { error: 'File not found' },
          { 
            status: 404,
            headers: {
              'Cache-Control': 'no-store' // 不缓存404
            }
          }
        );
      }
    }
  } catch (err) {
    console.error('Error handling image request:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}