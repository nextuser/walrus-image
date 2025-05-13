import { clsx, type ClassValue } from "clsx"
import { request } from "http";
import * as crypto from 'crypto';
import { twMerge } from "tailwind-merge"
import path from 'path'
import {FileRange} from '@/lib/utils/types'
import { getExtTypeByContentType } from "./utils/content";
import { TAR_DIR } from "./utils/dirs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateHash(buffer: Buffer): string {
    // 创建一个SHA-256哈希对象
    const hash = crypto.createHash('sha256');
    // 更新哈希对象的内容
    hash.update(buffer);
    // 计算哈希值并以十六进制字符串形式返回
    return hash.digest('hex');
}

export function getImageUrl(request : Request, fileName : string) : string{
  let site_url = getSiteUrl(request);
  return getImageSiteUrl(site_url,fileName);
}

export function getImageSiteUrl(siteUrl:string, fileName:string){
  const fileUrl = `${siteUrl}/image/${fileName}`;
  return fileUrl;
}

export function getUploadUrl(request:Request,fileName:string) :string{
  let site_url = getSiteUrl(request);
  return site_url + "/uploads/" + encodeURIComponent(fileName);
}

export function getSiteUrl(request: Request){
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || '';
  return  `${protocol}://${host}`;

}

function getTarUrl(protocol:string,host:string,tarfile : string,contentType : number, range:FileRange){

  return `${protocol}://${host}/tar/${tarfile}/?start=${range.start}&end=${range.end}&contentType=${contentType}`;
}


// export function getBlobOrTarUrl(request : Request,blobInfo: FileBlobInfo):string{
  
//   const protocol = request.headers.get('x-forwarded-proto') || 'http';
//   const host = request.headers.get('host') || '';
//   if(!blobInfo){
//     return `${protocol}://${host}/tar/not_found`
//   }
//   return  getBlobTarUrl(protocol,host,blobInfo)
// }

export function getTarPath(tarfile : string){
  return path.join(TAR_DIR, tarfile);
}

// ${hash}.jpg   => ${hash}
export function getHash(fileName : string){
  let index = fileName.indexOf(".");
  if(index == -1){
    return fileName;
  }
  return fileName.substring(0, index);
}

export function getExt(fileName : string){
  let index = fileName.lastIndexOf('.')
  return index != -1 ? fileName.substring(index + 1) : 'bin'
}


