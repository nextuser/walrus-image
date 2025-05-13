import CopyButton from '@/components/CopyButton';
import { request } from 'http';
import Image from 'next/image'
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ImageShow from './image_show';
import { FileUrl } from '@/lib/utils/types';
import { getContentTypeByMimetype, getMimeTypeFromExtension } from '@/lib/utils/content';
import { getTuskyFile } from '@/lib/tusky/tusky_server';
import { getFullUrl } from '@/lib/utils/serverUtil';
import { getTuskySiteUrl } from '@/lib/tusky/tusky_common';
// 定义页面 props 的类型
interface ImageViewProps {
    params: Promise<{ file_id: string[] }>; // 动态路由参数
}

// Server Component
export default async function ImageView({ params }: ImageViewProps) {
   
      // 获取请求头

    const file_id = (await params).file_id ;
    if(typeof(file_id) != 'string'){
        return  <h2>invalid parameter</h2>
    }

    console.log('@modal/imageView file_id=',file_id);
    const file = await getTuskyFile(file_id);
    const type = getMimeTypeFromExtension(file.mimeType) || 'bin'
    const siteUrl = await getFullUrl()
    const url = getTuskySiteUrl(siteUrl,file)
    console.log('@modal/imageView url=',url,'siteUrl', siteUrl);
    const fileInfo :FileUrl ={
        name : file_id,
        url : url,
        type : type
    }
    return <ImageShow fileInfo={fileInfo}></ImageShow>
}