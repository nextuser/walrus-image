import { getImageUrl } from "@/lib/utils";
import { getFileHashesFor, getFileInfo } from "@/lib/utils/globalData";
import {FileUrl} from '@/lib/utils/types'
import { NextResponse } from "next/server";
import { getTypeUrl } from "@/lib/utils/globalData";
export async function GET(request: Request) {
    const urls : FileUrl[] = [];
    const url = new URL(request.url);
    const owner : string = url.searchParams.get('owner') as string
    console.log('owner:',owner);
    console.log('url',request.url);
    if(!owner){
        return NextResponse.json({message: 'bad arg owner'}, {status : 500});
    }
    const ids = getFileHashesFor(owner);
    
    console.log(ids );
    for(let id of ids){
        let fileInfo = getFileInfo(id)
        if(!fileInfo){
            console.error("fail to find fileInfo for ",id)
            continue;
        }
        const [type,url] = getTypeUrl(request ,fileInfo)
        
        
        urls.push({
            name : id,
            type,
            url : url
        })
    }
    return NextResponse.json({ data : urls},{status:200})
}