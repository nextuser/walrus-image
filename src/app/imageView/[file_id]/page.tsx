import CopyButton from '@/components/CopyButton';
import {  getExt, getHash, getImageSiteUrl, getSiteUrl } from '@/lib/utils';
import { request } from 'http';
import Image from 'next/image'
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ImageShow from './image_show';
import { FileUrl } from '@/lib/utils/types';
import { Copy, FileDiffIcon } from 'lucide-react';    
import { Button } from '@/components/ui/button';
import { getTuskyFile } from '@/lib/tusky/tusky_server'
import { getExtensionFromMimeType } from '@/lib/utils/content';
import { getImageTypeUrl } from '@/lib/tusky/tusky_server';
import { getTuskySiteUrl } from '@/lib/tusky/tusky_common';
import { getFullUrl } from '@/lib/utils/serverUtil';
// 定义页面 props 的类型
interface ImageViewProps {
    params: Promise<{ file_id: string }>; // 动态路由参数
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

    let file_id = (await params).file_id ;
    if(typeof(file_id) != 'string'){
        return  <h2>invalid parameter</h2>
    }

    file_id = decodeURIComponent(file_id)


    console.log('imageView',file_id);
    const tuskyFile = await getTuskyFile(file_id);
    const type = getExtensionFromMimeType((await tuskyFile).mimeType) || 'bin';
    console.log('imageView file id blobId',tuskyFile.id, tuskyFile.blobId)
    const sitUrl =  getFullUrl();
    const url = getTuskySiteUrl(siteUrl,tuskyFile);
    console.log('url=',url);
    const fileInfo :FileUrl ={
        name : tuskyFile.name ? tuskyFile.name : file_id ,
        url : url,
        type : type
    }


    return <div>
 
        <ImageShow fileInfo={fileInfo}></ImageShow></div>
}