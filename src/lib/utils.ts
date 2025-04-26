import { clsx, type ClassValue } from "clsx"
import { request } from "http";
import * as crypto from 'crypto';
import { twMerge } from "tailwind-merge"
import path from 'path'
import { FileBlob } from "./utils/suiParser";
import {FileBlobInfo,FileRange} from '@/lib/utils/types'

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
  const fileUrl = `${site_url}/images/${fileName}`;
  return fileUrl;
}


export function getSiteUrl(request: Request){
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || '';
  return  `${protocol}://${host}`;

}

function getTarUrl(protocol:string,host:string,tarfile : string,contentType : number, range:FileRange){

  return `${protocol}://${host}/tar/$tarfile}/?start=${range.start}&end=${range.end}&contentType=${contentType}`;
}
export function getBlobTarUrl(protocol:string,host:string,fb: FileBlobInfo):string{
    if(!fb.status.on_walrus) {
       return getTarUrl( protocol,host,fb.status.tarfile,fb.contentType,fb.range)
    }
    const blobId = encodeURIComponent(fb.status.walrus_info.blobId);
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

// ${hash}.jpg   => ${hash}
export function getHash(fileName : string){
  let index = fileName.indexOf(".");
  if(index == -1){
    return fileName;
  }
  return fileName.substring(0, index);
}
