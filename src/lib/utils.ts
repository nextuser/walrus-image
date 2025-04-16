import { clsx, type ClassValue } from "clsx"
import { request } from "http";
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
