'use client'
import { blob } from "stream/consumers";
import { getExtensionFromMimeType, getExtTypeByContentType } from "@/lib/utils/content";
import Link from 'next/link';
import { FileInfo } from "@/lib/utils/types";
//import { getFileBlob } from "@/lib/utils/globalData";
import { getProfile, getStorage } from "@/lib/utils/suiUtil";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useEffect,useState } from "react";
import { useStorage } from "@/app/storage_provider";
import { FileUrl } from "@/lib/utils/types";
import { getTuskyFilesFor } from "@/lib/tusky/tusky_server";
import { File as TuskyFile ,Paginated} from '@tusky-io/ts-sdk';
import { getSiteUrl } from "@/lib/client/urlUtil";
import { updateUrlInfo,UrlInfo } from "@/lib/client/urlUtil";
import { getImageSiteUrl } from "@/lib/utils";
import { getTuskySiteUrl } from "@/lib/tusky/tusky_common";
import { Button } from "@/components/ui/button";
import { Profile } from "@/lib/utils/suiTypes";

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
   const [files ,setFiles] = useState<TuskyFile[]>([]);
   const [nextToken,setNextToken] = useState<string>();
   const [urlInfo,setUrlInfo] = useState<UrlInfo>()
   const [profile,setProfile] = useState<Profile>()

   const queryProfile = async ()=>{
    if(!account || !storage) {
        return;
    }
    const parentId = storage.profile_map.id.id.bytes
    let profile = await getProfile(suiClient,parentId,account.address);
   }
   const query_files = async ()=>{

        if(!profile){
            return;
        }
        let url = `/api/files_for?vault_id=${encodeURIComponent(profile.vault_id)}`
        if(nextToken){
            url += `&next=${encodeURIComponent(nextToken)}`
        }

        fetch( url,{ method : 'GET', }).then((rsp)=>{
            if(!rsp.ok) {
                rsp.json().then((value)=>{
                    let pe = value.data as Paginated<TuskyFile>
                    setFiles(pe.items)
                    setNextToken(pe.nextToken)
                })
                return;
            } else{
                console.error('query fail', rsp.status, url);
            }
        })
            
    };
   useEffect(()=>{
        queryProfile();
        updateUrlInfo(setUrlInfo);
   },[account]);

   useEffect(()=>{
    query_files();
   },[profile])

    return (
        <div>
            <ul>{ 
                    files.map( (file:TuskyFile,index:number)=>{
                    const siteUrl = getSiteUrl(urlInfo);
                    const fileUrl = getTuskySiteUrl(siteUrl,file)
                    const file_id =  file.id
                    const type = getExtensionFromMimeType(file.mimeType);
                    return (<li key={file_id}>
                        <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" 
                        target='_blank'
                        key = {file_id}
                        href={fileUrl} >
                            {file_id}
                        </Link> <label>{type}</label>
                    </li>)
                    })
                }
            </ul>
            <Button className="text-blue-900 underline hover:no-underline visited:text-blue-300" onClick={query_files} >next</Button>
            <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" href="/upload">Upload</Link>
        </div>
    )
}