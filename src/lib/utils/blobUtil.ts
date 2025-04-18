import axios from 'axios';
import {log} from '@/lib/utils/logger' 
import { UploadedBlobInfo} from '@/lib/utils/types'
export interface UploadBlobConfig {
    initialEpochs?: string;
    initialPublisherUrl?: string;
    initialAggregatorUrl?: string;
    proxyUrl?: string;
}

export const DEFAULT_CONFIG: Required<UploadBlobConfig> = {
    initialEpochs: process.env.NEXT_PUBLIC_INITIAL_EPOCHS || '1',
    initialPublisherUrl: process.env.NEXT_PUBLIC_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space',
    initialAggregatorUrl: process.env.NEXT_PUBLIC_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space',
    proxyUrl: process.env.NEXT_PUBLIC_PROXY_URL || ''
};



const MAX_EPOCHS=53;
export async function uploadBlob(buffer: Buffer ) : Promise<UploadedBlobInfo>{
    try {
        const publisherUrl = DEFAULT_CONFIG.initialPublisherUrl;

        const uploadUrl = `${publisherUrl}/v1/blobs?epochs=${MAX_EPOCHS}`;
        log("upload url:",uploadUrl);
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: buffer,
        });

        if (!response.ok) {
            log("storeBlob: fail to upload");
            throw new Error('Something went wrong when storing the blob!');
        }

        const info = await response.json();
        log("upload info : ",info);
        let blobInfo: UploadedBlobInfo;

        if ('alreadyCertified' in info) {
            blobInfo = {
                status: 'Already certified',
                blobId: info.alreadyCertified.blobId,
                endEpoch: info.alreadyCertified.endEpoch,
                suiRef: info.alreadyCertified.event.txDigest,
            };
        } else if ('newlyCreated' in info) {
            blobInfo = {
                status: 'Newly created',
                blobId: info.newlyCreated.blobObject.blobId,
                endEpoch: info.newlyCreated.blobObject.storage.endEpoch,
                suiRef: info.newlyCreated.blobObject.id,
            };
        } else {
            throw new Error('Unexpected response format');
        }

        return blobInfo;
    } catch (error) {
        console.error('Error in storeBlob:', error);
        throw error;
    } finally {
    
    }
    
}
////https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blob}




export async function   downloadBlob(
    blobId:string,
    offset : number,
    size :number,
) : Promise<Uint8Array | void>{
    const aggregatorUrl = DEFAULT_CONFIG.initialAggregatorUrl;
    // 定义请求的 URL
    const url =  `${aggregatorUrl}/v1/blobs/${encodeURIComponent(blobId)}`;

    // 创建 Headers 实例
    const headers = new Headers();
    headers.append('range', `bytes=${offset}-${offset+size}`);
    //headers.append('Content-Type', 'mimeType');


    // 定义请求选项
    const requestOptions: RequestInit = {
        method: 'GET', // 请求方法
        headers: headers // 设置请求头
    };

    // 发起请求
    let rsp = await fetch(url, requestOptions);
    if(rsp.ok){
        return rsp.bytes();
    } else{
        console.error("fetch blob fail ",rsp.status)
    }
}
