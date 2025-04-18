// app/upload/page.tsx
'use client'; // 标记为客户端组件
import Link from 'next/link';
import ImageFileUpload from '@/components/ImageFileUpload';
import { useState } from 'react';
export default function UploadPage() {
    const [imageUrl ,setImageUrl ] = useState('');
    
    return (
    <div>
        <ImageFileUpload fileUrl={imageUrl} setFileUrl = {setImageUrl}/>
        <div>
        {imageUrl && 
        <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" href={imageUrl}> {imageUrl}</Link>
        }
        </div>
        <div>
        <Link href="/image_list" className="text-blue-900 underline hover:no-underline visited:text-blue-300">Blob Images</Link>
        </div>
    </div>)

}

