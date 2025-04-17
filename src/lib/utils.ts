import { clsx, type ClassValue } from "clsx"
import { request } from "http";
import * as crypto from 'crypto';
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getSiteUrl(request: Request){
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || '';
  return  `${protocol}://${host}`;

}

export function getImageUrl(request : Request, fileName : string) : string{
  let site_url = getSiteUrl(request);
  const fileUrl = `${site_url}/images/${fileName}`;
  return fileUrl;
}




export function generateHash(buffer: Buffer): string {
    // 创建一个SHA-256哈希对象
    const hash = crypto.createHash('sha256');
    // 更新哈希对象的内容
    hash.update(buffer);
    // 计算哈希值并以十六进制字符串形式返回
    return hash.digest('hex');
}
