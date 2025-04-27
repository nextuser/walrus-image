import { blob } from "stream/consumers";
import { getExtTypeByContentType } from "@/lib/utils/content";
import { headers } from "next/headers";
import Link from 'next/link';
import { getFiles } from "@/lib/utils/globalData";
import { FileInfo } from "@/lib/utils/types";
import { getFileBlob } from "@/lib/utils/globalData";
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

    return (
        <div>
            <ul>{ 
                    files.map( (fileInfo:FileInfo)=>{
                    const type = getType(fileInfo)
                    return (<li key={fileInfo.hash}>
                        <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" 
                        target='_blank'
                        href={`${protocol}://${host}/images/${fileInfo.hash}.${getExtTypeByContentType(fileInfo.content_type)}`} >
                            {fileInfo.hash}
                        </Link> <label>{type}</label>
                    </li>)
                    })
                }
            </ul>
            <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" href="/upload">Upload</Link>
        </div>
    )
}