import { blob } from "stream/consumers";
import { getExtTypeByContentType } from "@/lib/utils/content";
import { headers } from "next/headers";
import Link from 'next/link';
import { getFiles } from "@/lib/utils/globalData";
import { FileInfo } from "@/lib/utils/types";
import { getFileBlob } from "@/lib/utils/globalData";
import CopyButton from "@/components/CopyButton";
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
                    files.map( (fileInfo:FileInfo,index)=>{
                    const type = getType(fileInfo)
                    const imageUrl = `${protocol}://${host}/images/${fileInfo.hash}.${getExtTypeByContentType(fileInfo.content_type)}`;
                    return (<li key={fileInfo.hash + String(index)}>
                        <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" 
                        target='_blank'
                        href={imageUrl} >
                            {fileInfo.hash}
                        </Link> 
                        <CopyButton copy_value={imageUrl} display={type} size={12} fontSize={12} className="flex inline-flex"></CopyButton>
                    </li>)
                    })
                }
            </ul>
            
            <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" href="/upload">Upload</Link>
        
        <div className="flex justify-start flex-wrap ">
        {files.map( (fileInfo:FileInfo,index)=>{
                    const type = getType(fileInfo)
                    const key = fileInfo.hash + String(index);
                    const imageUrl = `${protocol}://${host}/images/${fileInfo.hash}.${getExtTypeByContentType(fileInfo.content_type)}`;
                    return (<div key={key}><img src={imageUrl} style={{width:250,height:250}} />
                        <CopyButton copy_value={imageUrl} display={type} size={12} fontSize={12} className="flex inline-flex"></CopyButton>
                        </div>)
                    })
        }
        </div>
        </div>
    )
}