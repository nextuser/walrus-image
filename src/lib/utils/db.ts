import { FileRange } from './types';
import {SuiClient } from '@mysten/sui/client';
import { FileBlobInfo } from './types';
import fs from 'fs';
import * as fsp from 'fs/promises';
import path from 'path';
import tar from 'tar-stream';
import { TAR_DIR } from './dirs';
import {getFileContentType} from '@/lib/utils/content'

export function uploadTarToWalrus(tarFile :string) : string{
    let blobId :string =  generateId();
    let dest = path.join(TAR_DIR,blobId);
    //todo 没有上传，先将tar文件移动
    moveFile(tarFile,dest);
    return blobId;
}



async function moveFile(sourcePath: string, destinationPath: string): Promise<void> {
  try {
    // 确保目标目录存在
    const destinationDir = path.dirname(destinationPath);
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    // 移动文件
    await fs.promises.rename(sourcePath, destinationPath);
    console.log(`文件已从 ${sourcePath} 移动到 ${destinationPath}`);
  } catch (error) {
    console.error('移动文件时出错:', error);
    throw error;
  }
}

export function getBlobInfoFromDB(blobMap:Map<string,FileBlobInfo>,hash : string) 
                                : FileBlobInfo | undefined{
    return blobMap.get(hash)
}

export async  function readBlob(blob : FileBlobInfo) : Promise<Buffer>{
    const tarfile  = path.join(TAR_DIR, blob.blobId);
    const fh =  await fsp.open(tarfile,'r');
    const length = blob.range.end - blob.range.start ;
    const buffer = Buffer.alloc(length);
    const {bytesRead } =  await fh.read({
        buffer,
        offset : 0,
        length,
        position : blob.range.start, 
    });
    return  buffer;

}

export function getBlobUrl(protocol:string,host:string,blobInfo: FileBlobInfo):string{
    return  `${protocol}://${host}/tar/${blobInfo.blobId}/?start=${blobInfo.range.start}&end=${blobInfo.range.end}&contentType=${blobInfo.contentType}`
}

export function saveBlobInfoToDB(
  blobMap:Map<string,FileBlobInfo>,
    file : string, 
    blobId : string, 
    fileRange : FileRange) :FileBlobInfo
{
    let contentType = getFileContentType(file);
    let bi :FileBlobInfo = {
        blobId:blobId,
        contentType,
        range : fileRange
    }

    blobMap.set(file,bi);

    console.log('file blob info:' , bi);
    return bi;

}


import * as crypto from 'crypto'
function generateId(length: number = 16): string {
    // 浏览器和Node.js都支持的crypto API
    //const cryptoObj = window.crypto || (window as any).msCrypto; // 浏览器
    const cryptoObj = crypto;
    // 或者在Node.js中: import * as crypto from 'crypto';
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    
    if (cryptoObj && cryptoObj.getRandomValues) {
      const randomValues = new Uint32Array(length);
      cryptoObj.getRandomValues(randomValues);
      
      for (let i = 0; i < length; i++) {
        id += chars[randomValues[i] % chars.length];
      }
    } else {
      // 回退方案（不推荐用于安全场景）
      for (let i = 0; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    
    return id;
  }
  

  //todo  这个用作参考，后面会删除
  // const { storeBlob ,aggregatorUrl} = useUploadBlob()

  // const storeFile = async function (file:File | string) : Promise<string>{
    
  //    // 1. 上传到 Walrus
  //    const blobInfo = await storeBlob(file)
  //    const url = `${aggregatorUrl}/v1/blobs/${blobInfo.blobId}`
  //    console.log("store file ,url=",url);
  //    return url;
  // }