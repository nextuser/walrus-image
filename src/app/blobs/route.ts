// pages/api/route.ts
import { NextRequest, NextResponse } from 'next/server';
import http from 'http';
import https from 'https';
import { getMimeTypeByContentType } from '@/lib/utils/content';
import { HttpStatusCode } from 'axios';
import { DEFAULT_CONFIG } from '@/lib/utils/blobUtil';
import { getContentTypeByMimetype } from '@/lib/utils/content';
import { Readable } from 'stream';
import { log } from 'console';

type Context = {
  params: Promise<{
    blobId: string;
  }>;
};
export async function GET(
  request: Request,
  context : Context 
) {
    console.log("/blob/request url",request.url);
    let urlObj = new URL(request.url);
    //let blobId = (await context.params).blobId;
    let searchParams = urlObj.searchParams;
    let blobId = searchParams.get('blobId');
    
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const contentType = Number(searchParams.get("contentType") );
    console.log(`http tar:start=${start},end =${end} ,contentType=${contentType} blobId=${blobId}`);
    const mimeType = getMimeTypeByContentType(contentType);
    if(!start || !end || !blobId){

        return NextResponse.json({message:`invalid arg of start:${start},end =${end} ,contentType=${contentType}`},{status:400});
    }
    blobId = decodeURIComponent(blobId);
    const startRange = parseInt(start, 10);
    const endRange = parseInt(end, 10);

    if (isNaN(startRange) || isNaN(endRange)) {
        return NextResponse.json({ message: 'Invalid range parameters' }, { status: 400 });
    }
    const aggregatorUrl = DEFAULT_CONFIG.initialAggregatorUrl;
      // 定义请求的 URL
    const targetUrl =  `${aggregatorUrl}/v1/blobs/${encodeURIComponent(blobId)}`;

    const url = new URL(targetUrl);
    const httpModule = url.protocol === 'http' ? http : https;
    // 创建 Headers 实例
    console.log("/blobs: targetUrl",targetUrl);
    const headers = {
      range: `bytes=${start}-${end}`
    };

    return fetch(url,{
      method : 'GET',
      headers:headers,
    }).then((rsp:Response)=>{
        log("rsp status",rsp.status,rsp.statusText);
        if(rsp.ok){
          const body = rsp.body;
          console.log('fetch rsp ok',rsp.status)
          return new NextResponse(body, {
            status: 200,
            headers:{'Content-Type' : getMimeTypeByContentType(contentType) }
          });
        } else{
          log('rsp fail ', rsp.status);
          return  NextResponse.json({msg: rsp.statusText}, {status:404});
        }
    }).catch((reason:any)=>{
      const msg = `fetch blob fail:reason=${reason}`;
      console.log(msg);
      return  NextResponse.json({msg}, {status:501}); 
    })
}