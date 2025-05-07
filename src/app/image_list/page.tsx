'use client'
import { blob } from "stream/consumers";
import { getExtTypeByContentType } from "@/lib/utils/content";
//import { headers } from "next/headers";
import Link from 'next/link';
import { FileBlobInfo, FileInfo } from "@/lib/utils/types";
//import { getFileBlob } from "@/lib/utils/globalData";
import { Copy } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { emptyFileBlobEvents,queryFileBlobEvents } from "@/lib/utils/suiUtil";
import { useState } from "react";
import { FileBlobEvents,Cursor } from "@/lib/utils/suiUtil";
import { useSuiClient } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { getBlobTarUrl } from "@/lib/utils";
import { url } from "inspector";
type UrlInfo = {
    protocol: string,
    host: string,
    port: string,
}
export default function Page() {

      // 通过 headers() 获取请求头信息
//   const headersList = await headers();
//    const host = headersList.get("host")!; // "www.s.com:8080"
//    const protocol = headersList.get("protocol") || "http";
//    console.log("protocol host:" ,protocol,host);
   const  [fileBlobEvents, setFileBlobEvents ] = useState<FileBlobEvents>(emptyFileBlobEvents()); 
   const suiClient = useSuiClient();
   const [ prevCursor ,setPrevCursor ] = useState();

   const [urlInfo, setUrlInfo] = useState<UrlInfo>();

  // 在组件挂载时提取 URL 信息
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url : UrlInfo = {
        protocol: window.location.protocol, // 协议，如 "http:" 或 "https:"
        host: window.location.host,         // 主机，如 "localhost:3000" 或 "example.com"
        port: window.location.port,         // 端口，如 "3000" 或 ""（默认端口）
      }
      setUrlInfo(url);
      console.log("setUrlInfo:",url);
      console.log("location:",window.location)
    }
  }, []);

   const queryCursor = (cursor : Cursor) => {
        queryFileBlobEvents(suiClient,cursor).then((value) =>{
            setFileBlobEvents(value)
        })
   }
   useEffect( ()=>{   queryCursor(fileBlobEvents.cursor) },[suiClient]); 

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
            <p className="text-2xl pt-2 max-2 px-2">Upload</p>
        </Link>
        <div className="grid grid-cols-2 gap-4 p-4">
            <div>
                <ul>{ urlInfo  &&
                        fileBlobEvents.fileBlobs.map( (fileInfo:FileBlobInfo,index)=>{
                        //const type = getType(fileInfo)
                        const imageUrl = getBlobTarUrl(urlInfo.protocol,urlInfo.host,fileInfo);
                        return (<li key={fileInfo.hash + String(index)}>
                            <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" 
                            target='_blank'
                            href={imageUrl} >
                                <span className="text-xl pt-2 max-2 px-2">
                                {fileInfo.hash}</span>
                            </Link><button ></button> 
                            <CopyButton copy_value={imageUrl} display={'blob'} size={12} fontSize={12} className="flex inline-flex"></CopyButton>
                        </li>)
                        })
                    }
                </ul>
            
            </div>
            <div className="flex justify-start flex-wrap ">
            {urlInfo && fileBlobEvents.fileBlobs.map( (fileInfo:FileBlobInfo,index)=>{
                        const type = 'blob'
                        const key = fileInfo.hash + String(index);
                        const fileName = `${fileInfo.hash}.${getExtTypeByContentType(fileInfo.contentType)}`;
                        const imageUrl =  getBlobTarUrl(urlInfo.protocol,urlInfo.host,fileInfo);
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
            <div className="flex flex-row mx-2 px-2 pt-2">
                <Button className="px-2" onClick={ () => queryCursor(undefined )}>Home</Button>
                <Button className="px-2" onClick={ () => queryCursor(fileBlobEvents.prev )}>Prev</Button>
                <Button className="px-2" onClick={ () => queryCursor(fileBlobEvents.next )}> Next</Button>
            </div>
        </div>
        </div>
    )
}