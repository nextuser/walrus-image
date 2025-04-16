import { getBlobMap } from "@/lib/utils/globalData"
import { blob } from "stream/consumers";
import {getBlobUrl} from "@/lib/utils/db"

import { headers } from "next/headers";
import Link from 'next/link';


export default async  function Page() {

      // 通过 headers() 获取请求头信息
   const headersList = await headers();
   const host = headersList.get("host")!; // "www.s.com:8080"
   const protocol = headersList.get("protocol") || "http";
   console.log("protocol host:" ,protocol,host);
   ///console.log(headersList);
    const blobMap = getBlobMap();
    let list = Array.from(blobMap.entries());
    return (
        <div>
            <ul>{ 
                    list.map( ([key,value])=>{
                    return (<li key={`${value.blobId}_${value.range.start} `}>
                        <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" href={getBlobUrl(protocol,host,value)} >{key}</Link>
                    </li>)
                    })
                }
            </ul>
        </div>
    )
}