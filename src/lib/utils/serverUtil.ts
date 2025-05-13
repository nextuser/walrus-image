// app/utils/getFullUrl.ts
import { headers } from 'next/headers';

export async function getFullUrl(pathname: string = '') {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const proto = headersList.get('x-forwarded-proto') || 'http';
  
  // 移除 leading slash 避免双斜杠
  const cleanPathname = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  return `${proto}://${host}/${cleanPathname}`;
}