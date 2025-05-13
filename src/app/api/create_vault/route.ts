import { getImageUrl } from "@/lib/utils";
import {FileUrl} from '@/lib/utils/types'
import { NextResponse } from "next/server";
import { getServerTusky, getTuskyUrl } from "@/lib/tusky/tusky_server";
import { getExtensionFromMimeType } from "@/lib/utils/content";
import { getVaultName } from "@/lib/tusky/tusky_common";
export async function GET(request: Request) {
    const urls : FileUrl[] = [];
    const url = new URL(request.url);

    const owner : string = url.searchParams.get('owner') as string
    if(!owner){
        return NextResponse.json({message: 'bad arg owner'}, {status : 500});
    }
    const vault_name = getVaultName(owner);
    console.log('vault name:',vault_name);
    const tusky = getServerTusky();
    const vault = await  tusky.vault.create(vault_name,{encrypted:false});
    console.log('create vault, reutrn vault_id :',vault.id);

    return NextResponse.json({vault_id : vault.id },{status:200})
}