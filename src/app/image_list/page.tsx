import { blob } from "stream/consumers";
import { getExtTypeByContentType } from "@/lib/utils/content";
import { headers } from "next/headers";
import Link from 'next/link';
import { getFiles } from "@/lib/utils/globalData";
import { FileInfo } from "@/lib/utils/types";
import { getFileBlob } from "@/lib/utils/globalData";
import getFs from '@/lib/imagefs'
import { Copy } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import Image from 'next/image'
function getType(fileInfo:FileInfo){
    
    let status = getFileBlob(fileInfo.hash);
    if(status == null){
        return getExtTypeByContentType(fileInfo.content_type);
    }
    if(status.status.on_walrus){
        return 'blob'
    } else{
        return 'tar'
    }
}

export default async  function Page() {

      // 通过 headers() 获取请求头信息
   const headersList = await headers();
   const host = headersList.get("host")!; // "www.s.com:8080"
   const protocol = headersList.get("protocol") || "http";
   console.log("protocol host:" ,protocol,host);

   const files = getFiles();
   ///console.log(headersList);

    const copyContent = async (text:string) => {
        try {
        await navigator.clipboard.writeText(text);
        console.log('Content copied to clipboard');
        } catch (err) {
        console.error('Failed to copy: ', err);
        }
    }

    return (
        <div> 
        <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" href="/upload">
            <p className="text-2xl pt-2 max-2 px-2">Upload</p></Link>
        <div className="grid grid-cols-2 gap-4 p-4">
            <div>
                <ul>{ 
                        files.map( (fileInfo:FileInfo,index)=>{
                        const type = getType(fileInfo)
                        const imageUrl = `${protocol}://${host}/image/${fileInfo.hash}.${getExtTypeByContentType(fileInfo.content_type)}`;
                        return (<li key={fileInfo.hash + String(index)}>
                            <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" 
                            target='_blank'
                            href={imageUrl} >
                                <span className="text-xl pt-2 max-2 px-2">
                                {fileInfo.hash}</span>
                            </Link><button ></button> 
                            <CopyButton copy_value={imageUrl} display={type} size={12} fontSize={12} className="flex inline-flex"></CopyButton>
                        </li>)
                        })
                    }
                </ul>
            
            </div>
            <div className="flex justify-start flex-wrap ">
            {files.map( (fileInfo:FileInfo,index)=>{
                        const type = getType(fileInfo)
                        const key = fileInfo.hash + String(index);
                        const fileName = `${fileInfo.hash}.${getExtTypeByContentType(fileInfo.content_type)}`;
                        const imageUrl = `${protocol}://${host}/image/${fileName}`;
                        return (
                        <div key={key}  >
                            <Link href={`/imageView/${fileName}`} >
                                <img src={imageUrl}  alt={fileInfo.hash} 
                                    className="max-w-[200px] max-h-[200px] object-cover"
                                />
                            </Link>
                            </div>)
                        })
            }
            </div>
        </div>
        </div>
    )
}