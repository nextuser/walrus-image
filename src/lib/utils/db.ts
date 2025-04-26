import { FileRange, UploadStatus } from './types';
import {SuiClient } from '@mysten/sui/client';
import { FileBlobInfo,WalrusInfo } from './types';
import fs from 'fs';
import * as fsp from 'fs/promises';
import path from 'path';
import tar from 'tar-stream';
import { TAR_DIR } from './dirs';
import {registerFileBobInfo} from '@/lib/utils/globalData'
import {uploadBlob} from '@/lib/utils/blobUtil';
import { log} from '@/lib/utils/logger'
import { getTarPath } from '../utils';
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

export async function saveBlob(tarfile :string) : Promise<UploadStatus | null> {
    const filePath = getTarPath(tarfile);
    return fsp.readFile(filePath).then( (buffer:Buffer)=>{

      return uploadBlob(buffer).then((blobInfo : WalrusInfo)=>{
        
        let status :UploadStatus = {
          on_walrus : true,
          walrus_info : blobInfo
        }
        log("saveBlob" ,tarfile,"status:",status);
        return status
      }).catch((reason :any)=>{
        log("saveBlob:upload fail reason:",reason);
        let status :UploadStatus = {
          tarfile,
          on_walrus:false
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
  

  