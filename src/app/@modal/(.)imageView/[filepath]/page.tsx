import CopyButton from '@/components/CopyButton';
import { getBlobTarUrl, getExt, getHash, getImageSiteUrl } from '@/lib/utils';
import { getFileBlob } from '@/lib/utils/globalData';
import { request } from 'http';
import Image from 'next/image'
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ImageShow from './image_show';
import { FileUrl } from '@/lib/utils/types';
    
// 定义页面 props 的类型
interface ImageViewProps {
    params: Promise<{ filepath: string[] }>; // 动态路由参数
}

// Server Component
export default async function ImageView({ params }: ImageViewProps) {
    
      // 获取请求头
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';

    // 获取 protocol
    const forwardedProto = headersList.get('x-forwarded-proto');
    const protocol = forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');

    // 获取 host 和 port
    const hostHeader = headersList.get('host') || 'localhost';
    //const [host, portFromHost = ''] = hostHeader.split(':');
    const siteUrl = `${protocol}://${hostHeader}`;

    const filepath = (await params).filepath ;
    if(typeof(filepath) != 'string'){
        return  <h2>invalid parameter</h2>
    }
    const hash = getHash(filepath);
    const blob = getFileBlob(hash);
    const type = getExt(filepath)
    
    const url = blob ? getBlobTarUrl(protocol,hostHeader,blob) : getImageSiteUrl(siteUrl,filepath);
    const fileInfo :FileUrl ={
        name : filepath,
        url : url,
        type : type
    }
    return <ImageShow fileInfo={fileInfo}></ImageShow>
}