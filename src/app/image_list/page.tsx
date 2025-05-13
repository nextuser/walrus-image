'use client'
import { blob } from "stream/consumers";
import { getExtTypeByContentType } from "@/lib/utils/content";
//import { headers } from "next/headers";
import Link from 'next/link';
import { FileData } from "@/lib/utils/types";
//import { getFileBlob } from "@/lib/utils/globalData";
import { Copy } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { emptyFileDataEvents,queryFileDataEvents } from "@/lib/utils/suiUtil";
import { Suspense, useState } from "react";
import {FileDataEvents  } from "@/lib/utils/suiUtil";
import { useSuiClient } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { getSiteUrl, updateUrlInfo,UrlInfo } from "@/lib/client/urlUtil";
import { File as TuskyFile} from '@tusky-io/ts-sdk'
import { useSearchParams } from "next/navigation";
import { getImageUrlByFileData } from "@/lib/tusky/tusky_common";

export default function Page() {
    return <Suspense fallback="<h2>Loading</h2>" ><ImageList/></Suspense>
}

function ImageList(){
      // 通过 headers() 获取请求头信息
//   const headersList = await headers();
//    const host = headersList.get("host")!; // "www.s.com:8080"
//    const protocol = headersList.get("protocol") || "http";
//    console.log("protocol host:" ,protocol,host);
   const suiClient = useSuiClient();
   const [ prevCursor ,setPrevCursor ] = useState();

   const [urlInfo, setUrlInfo] = useState<UrlInfo>();
   const [files,setFiles] = useState<FileData[]|undefined>();
   const [events,setEvents ] = useState<FileDataEvents>(emptyFileDataEvents());
  // 在组件挂载时提取 URL 信息


  const searchParams = useSearchParams();
  const  isNext = searchParams.get('direction') != 'prev'

  const fetchUrls = async ()=>{
     queryFileDataEvents(suiClient,isNext, events).then((e)=>{
        setEvents(e);
     })
     
  }

  useEffect(() => {
    updateUrlInfo(setUrlInfo);
    if(!suiClient){
        return ;
    }
    fetchUrls();
  }, [suiClient]);

    const copyContent = async (text:string) => {
        try {
        await navigator.clipboard.writeText(text);
        console.log('Content copied to clipboard');
        } catch (err) {
        console.error('Failed to copy: ', err);
        }
    }
    const siteUrl = getSiteUrl(urlInfo);
    

    return (
        <div> 
        <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" href="/upload">
            <p className="text-2xl pt-2 max-2 px-2">Upload</p>
        </Link>
        <div className="grid grid-cols-2 gap-4 p-4">
            <div>
                <ul>{ events  &&
                        events.fileDatas.map( (fileData:FileData,index)=>{
                        const type = getExtTypeByContentType(fileData.mime_type)
                        const imageUrl = getImageUrlByFileData(siteUrl,fileData);
                        const file_id = fileData.file_id
                        return (<li key={file_id}>
                            <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" 
                            target='_blank'
                            href={imageUrl} >
                                <span className="text-xl pt-2 max-2 px-2">
                                {file_id}</span>
                            </Link><button ></button> 
                            <CopyButton copy_value={imageUrl} display={type} size={12} fontSize={12} className="flex inline-flex"></CopyButton>
                        </li>)
                        })
                    }
                </ul>
            
            </div>
            <div className="flex justify-start flex-wrap ">
            {events &&  events.fileDatas.map( (fileData:FileData,index)=>{
                        const type = getExtTypeByContentType(fileData.mime_type)
                        const file_id = fileData.file_id
                        const imageUrl = getImageUrlByFileData(siteUrl,fileData);
                        return (
                        <div key={file_id}  >
                            <Link href={`/imageView/${encodeURIComponent(file_id)}`} >
                                <img src={imageUrl}  alt={file_id} 
                                    className="max-w-[200px] max-h-[200px] object-cover"
                                />
                            </Link>
                            </div>)
                        })
            }
            </div>
            <div className="flex flex-row mx-2 px-2 pt-2">
                <Button className="px-2" onClick={ () => queryFileDataEvents(suiClient,true)}>Home</Button>
                <Button className="px-2" onClick={ () => queryFileDataEvents(suiClient,false, events)}>Prev</Button>
                <Button className="px-2" onClick={ () => queryFileDataEvents(suiClient,true, events)}> Next</Button>
            </div>
        </div>
        </div>
    )
}