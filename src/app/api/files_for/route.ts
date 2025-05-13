import { getImageUrl } from "@/lib/utils";
// import { getFileHashesFor, getFileInfo } from "@/lib/utils/globalData";
import {FileUrl} from '@/lib/utils/types'
import { NextResponse } from "next/server";
import { getServerTusky, getTuskyUrl } from "@/lib/tusky/tusky_server";
import { getExtensionFromMimeType } from "@/lib/utils/content";
import { getTuskyFilesFor } from "@/lib/tusky/tusky_server";
import { getProfile } from "@/lib/utils/suiUtil";
import { getServerSideSuiClient } from "@/lib/utils/tests/suiClient";
export async function GET(request: Request) {
    const tusky = getServerTusky();
    const urls : FileUrl[] = [];
    const url = new URL(request.url);
    const vault_id : string = url.searchParams.get('vault_id') as string
    const next : string = url.searchParams.get('next') as string;
    const sc = getServerSideSuiClient();
   // let profile = await getProfile(sc,)
    console.log('owner:',vault_id);
    console.log('url',request.url);
    if(!vault_id){
        return NextResponse.json({message: 'bad arg vault_id'}, {status : 500});
    }

    const pe = await  getTuskyFilesFor(vault_id,next)
    if(pe.errors){
        console.error("getTuskyFilesFor error",pe.errors);
        return NextResponse.json({message : 'getTuskyFilesFor error '},{status:500});
    }
    
    return NextResponse.json({ result : pe},{status:200})
}