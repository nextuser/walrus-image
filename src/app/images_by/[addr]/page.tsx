'use client'
import { blob } from "stream/consumers";
import { getExtTypeByContentType } from "@/lib/utils/content";
import Link from 'next/link';
import { FileInfo } from "@/lib/utils/types";
//import { getFileBlob } from "@/lib/utils/globalData";
import { getFileBlobsFor,getProfile, getStorage } from "@/lib/utils/suiUtil";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useEffect,useState } from "react";
import { useStorage } from "@/app/storage_provider";
import { FileBlobType } from "@/lib/utils/suiParser";
import { u256_to_hash } from "@/lib/utils/convert";
import { FileUrl } from "@/lib/utils/types";
import { stringify } from "querystring";
// function getType(fileInfo:FileInfo){
    
//     let status = getFileBlob(fileInfo.hash);
//     if(status == null){
//         return getExtTypeByContentType(fileInfo.content_type);
//     }
//     if(status.status.uploaded){
//         return 'blob'
//     } else{
//         return 'tar'
//     }
// }

// // 获取主机和端口信息
// const getHostAndPort = () => {
//     const { hostname, port } = window.location;
//     return {
//         host: hostname,
//         port: port || (window.location.protocol === 'https:' ? '443' : '80')
//     };
// };
export default function Page() {

    // 使用示例
   const account = useCurrentAccount();
   const storage = useStorage()?.storage;
   const suiClient = useSuiClient();
   const [urls ,setUrls] = useState<FileUrl[]>([]);
   
   
   useEffect(()=>{
        if(!account || !storage) {
            return;
        }
        const parentId = storage.profile_map.id.id.bytes
        fetch( "/api/files_for?owner=" + encodeURIComponent(account.address),{
            method : 'GET',
        }).then((rsp)=>{
            if(!rsp.ok) {
                setUrls([]);
                return;
            }
            rsp.json().then((value)=>{
                setUrls(value.data as FileUrl[])
            })
        })
  
   },[account]);

    return (
        <div>
            <ul>{ 
                    urls.map( (fileUrl:FileUrl,index:number)=>{
                    const hash = fileUrl.name;
                    const key = hash + String(index)
                    return (<li key={key}>
                        <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" 
                        target='_blank'
                        key = {hash}
                        href={fileUrl.url} >
                            {hash}
                        </Link> <label>{fileUrl.type}</label>
                    </li>)
                    })
                }
            </ul>
            <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" href="/upload">Upload</Link>
        </div>
    )
}