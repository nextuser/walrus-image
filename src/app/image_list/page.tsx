import { getBlobMap } from "@/lib/utils/globalData"
import { blob } from "stream/consumers";
import {getBlobUrl} from "@/lib/utils/db"

import { headers } from "next/headers";
import Link from 'next/link';
import { getFiles } from "@/lib/utils/globalData";

export default async  function Page() {

      // 通过 headers() 获取请求头信息
   const headersList = await headers();
   const host = headersList.get("host")!; // "www.s.com:8080"
   const protocol = headersList.get("protocol") || "http";
   console.log("protocol host:" ,protocol,host);

   const files = getFiles();
   ///console.log(headersList);

    return (
        <div>
            <ul>{ 
                    files.map( (fileName)=>{
                    return (<li key={fileName}>
                        <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" 
                        href={`${protocol}://${host}/images/${fileName}`} >{fileName}</Link>
                    </li>)
                    })
                }
            </ul>
            <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" href="/upload">Upload</Link>
        </div>
    )
}