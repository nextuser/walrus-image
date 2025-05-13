import { Tusky } from "@tusky-io/ts-sdk";
import { DEFAULT_CONFIG } from "../utils/blobUtil";
import { FileInfo } from "../utils/types";
import { getExtTypeByContentType } from "../utils/content";
import { getSiteUrl } from "../utils";
import { File as TuskyFile } from '@tusky-io/ts-sdk';
import dotenv from 'dotenv'
dotenv.config();
const apiKey = process.env.TUSKY_API_KEY
if(!apiKey){
    console.error('export TUSKY_API_KEY=  first');
    process.exit(-1)
}

export function getTuskeyApiKey(){
    return apiKey || ''
}

const tusky = new Tusky({ apiKey:  getTuskeyApiKey()});
export function getServerTusky(){
    return tusky;
}
export function getBlobUrl(blobId : string){
    return   `${DEFAULT_CONFIG.initialAggregatorUrl}/v1/blobs/${encodeURIComponent(blobId)}`
}

export async function  getImageTypeUrl(request : Request,fileInfo:FileInfo):Promise<[string,string]> {
   let blob_id :string | undefined = fileInfo.blob_id;
   const ext = getExtTypeByContentType(fileInfo.content_type) 
   if(!blob_id){
    let file = await tusky.file.get(fileInfo.file_id)
    blob_id = file.blobId;
    file.blobId = file.blobId
   }
   if(blob_id){
        const aggregatorUrl = DEFAULT_CONFIG.initialAggregatorUrl;
          // 定义请求的 URL
        const targetUrl =  `${aggregatorUrl}/v1/blobs/${encodeURIComponent(blob_id)}`
        return [ext,targetUrl];
   } else{
        return [ext,`${getSiteUrl(request)}/image/${fileInfo.file_id}`]
   }

}

export function getTuskyUrl(request : Request,file : TuskyFile){
    if(file.blobId){
        const aggregatorUrl = DEFAULT_CONFIG.initialAggregatorUrl;
          // 定义请求的 URL
        const targetUrl =  `${aggregatorUrl}/v1/blobs/${encodeURIComponent(file.blobId)}`
        return targetUrl;
   } else{
        return `${getSiteUrl(request)}/image/${file.file_id}`
   }
}


export async function getTuskyFile(file_id : string) 
                                : Promise<TuskyFile>{
    
    return  tusky.file.get(file_id)
}

export async function getTuskyFilesFor(vaultId:string,nextToken? :string) {
    return tusky.file.list({shouldDecrypt : false, vaultId: vaultId,status:'active',nextToken})
}