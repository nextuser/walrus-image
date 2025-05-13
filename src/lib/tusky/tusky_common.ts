import dotenv from 'dotenv'
import { Tusky } from '@tusky-io/ts-sdk';
import { DEFAULT_CONFIG } from '../utils/blobUtil';
import { File as TaskyFile } from "@tusky-io/ts-sdk";
import { FileData } from '../utils/types'
dotenv.config();




export function getImageUrlByFileData(siteUrl:string,fileData:FileData){
  return `${siteUrl}/image/${fileData.file_id}`
}

export function getVaultName(address : string) : string{
   let max = Math.max(address.length,34) // 32 * 4 =128
   return address.startsWith('0x') ? address.slice(2,max) : address
}



export function getTuskySiteUrl(siteUrl:string,file : TaskyFile){
    if(!file.blobId ||  file.blobId == 'unknown'){
        return `${siteUrl}/image/${file.id}`
    }else
    {
        const aggregatorUrl = DEFAULT_CONFIG.initialAggregatorUrl;
          // 定义请求的 URL
        const targetUrl =  `${aggregatorUrl}/v1/blobs/${encodeURIComponent(file.blobId)}`
        return targetUrl;
   } 
}