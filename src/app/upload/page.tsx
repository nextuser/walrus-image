// app/upload/page.tsx
'use client'; // 标记为客户端组件
import Link from 'next/link';
import ImageFileUpload from '@/components/ImageFileUpload';
import { useState } from 'react';
export default function UploadPage() {
    const [imageUrl ,setImageUrl ] = useState('');
    
    return (<div><ImageFileUpload fileUrl={imageUrl} setFileUrl = {setImageUrl}
    ></ImageFileUpload>
    <Link href={imageUrl}> {imageUrl}</Link>
    </div>)

}