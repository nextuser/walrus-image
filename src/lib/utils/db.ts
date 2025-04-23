import { FileRange, UploadStatus } from './types';
import {SuiClient } from '@mysten/sui/client';
import { FileBlobInfo,UploadedBlobInfo } from './types';
import fs from 'fs';
import * as fsp from 'fs/promises';
import path from 'path';
import tar from 'tar-stream';
import { TAR_DIR } from './dirs';
import {getContentType,registerFileBobInfo} from '@/lib/utils/globalData'
import {uploadBlob,downloadBlob} from '@/lib/utils/blobUtil';
import { log} from '@/lib/utils/logger'
import { registerToDelete} from '@/lib/utils/globalData'
import { getAddBlobTx } from './suiUtil';
export function moveToTarDir(tarFile :string) : string{
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






function getTarUrl(protocol:string,host:string,tarfile : string,contentType : number, range:FileRange){

  return `${protocol}://${host}/tar/$tarfile}/?start=${range.start}&end=${range.end}&contentType=${contentType}`;
}
export function getBlobTarUrl(protocol:string,host:string,fb: FileBlobInfo):string{
    if(!fb.status.uploaded) {
       return getTarUrl( protocol,host,fb.status.tarfile,fb.contentType,fb.range)
    }
    const blobId = encodeURIComponent(fb.status.uploadInfo.blobId);
    return  `${protocol}://${host}/blobs?blobId=${blobId}&start=${fb.range.start}&end=${fb.range.end}&contentType=${fb.contentType}`
}


export function getBlobOrTarUrl(request : Request,blobInfo: FileBlobInfo):string{
  
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || '';
  if(!blobInfo){
    return `${protocol}://${host}/tar/not_found`
  }
  return  getBlobTarUrl(protocol,host,blobInfo)
}

export function getTarPath(tarfile : string){
  return path.join(process.cwd(),"tars", tarfile);
}
export async function saveBlob(tarfile :string) : Promise<UploadStatus | null> {
    const filePath = getTarPath(tarfile);
    return fsp.readFile(filePath).then( (buffer:Buffer)=>{

      return uploadBlob(buffer).then((blobInfo : UploadedBlobInfo)=>{
        
        let status :UploadStatus = {
          uploaded : true,
          uploadInfo : blobInfo

        }
        log("saveBlob" ,tarfile,"status:",status);
        return status
      }).catch((reason :any)=>{
        log("saveBlob:upload fail reason:",reason);
        let status :UploadStatus = {
          tarfile,
          uploaded:false
        }
        return status;
      });
  }).catch( (reason)=>{
     console.log(`read tarfile[${filePath}] fail `,reason );
     return null;
  });
}
export  function recordFileBlobInfo (
    hash : string,
    contentType:number, 
    fileRange : FileRange,
    status : UploadStatus
  )  :FileBlobInfo
{
  let fb :FileBlobInfo = {
    hash,
    status,
    contentType,
    range : fileRange
  }
  //console.log(`saveBlobInfoToDB hash=${hash} fb=${fb}`);

  registerFileBobInfo(hash,fb);
  return fb;
  
}


import * as crypto from 'crypto'
import { blob } from 'stream/consumers';
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
  
// ${hash}.jpg   => ${hash}
export function getHash(fileName : string){
  let index = fileName.indexOf(".");
  if(index == -1){
    return fileName;
  }
  return fileName.substring(0, index);
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
