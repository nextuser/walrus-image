'use client'
import { use } from 'react'
import Image from 'next/image'
import { FileUrl } from '@/lib/utils/types'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// export default function Posts({
//   posts,
// }: {
//   posts: Promise<{ id: string; title: string }[]>
// }) {}


export default  function ImageShow( params : {fileInfo  : FileUrl}){
    const copyContent = async (text:string) => {
        try {
        await navigator.clipboard.writeText(text);
        console.log('Content copied to clipboard');
        } catch (err) {
        console.error('Failed to copy: ', err);
        }
    }   
    let f = params.fileInfo
    return <div className='flex flex-wrap' > <Input type="text" value={f.url} disabled={true} /> <br/>
             <Button onClick={(e)=>{ copyContent(f.url)}}><Copy></Copy>Copy url</Button>
            <img src={f.url} alt={f.name} width={300} height={300} className="w-full h-full rounded-lg" onClick={(e)=>{e.stopPropagation()}}></img>
        </div>
}
