import { SuiClient } from "@mysten/sui/client";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { FileInfo } from "./types";
import { FileBlobInfo } from "./types";
import { Transaction } from "@mysten/sui/transactions";
import config from '@/config/config.json'
import { fromBase64, toBase64,fromBase58 } from "@mysten/sui/utils";
import bs58 from 'bs58';
import { ProfileCreated,FileBlob,FileBlobCreated } from "./suiParser";
import { GasCostSummary } from "@mysten/sui/client";
/**
 * 
 public fun add_file(storage :&mut Storage,
                profile : &mut Profile,
                file_id:u256,
                mime_type: u8,
                size:u32,
                ctx : &mut TxContext) : u64
 */

export async function getAddFileTx(profileId : string,fileInfo:FileInfo){
    const file_id = BigInt('0x' + fileInfo.hash);
    const tx = new Transaction();
    tx.moveCall({
        target:`${config.pkg}::file_blob::add_file`,
        arguments:[tx.object(config.storage),
            tx.object(profileId),
            tx.pure.u256(file_id),
            tx.pure.u8(fileInfo.content_type),
            tx.pure.u32(fileInfo.size)]
       
    });
    return tx;

} 


function uint8ArrayToBigInt(arr: Uint8Array): bigint {
    let result = 0n;
    for (let i = 0; i < arr.length; i++) {
        // 将当前字节左移相应的位数
        result = (result << 8n) + BigInt(arr[i]);
    }
    return result;
}



/**
 * entry fun add_blob(profile :&mut Profile,
                file_id : u256,
                blob_id: u256,
                offset : u32,
                ctx : & TxContext)
 * @param suiClient 
 * @param owner 
 * @returns 
 */

 function getAddBlobTx(profile:string, fileBlob: FileBlobInfo) : Transaction | null{
    if(!fileBlob.status.uploaded) {
        return null;
    }

    const file_id = BigInt('0x' + fileBlob.hash);
    const tx = new Transaction();
    const blobIdArr  = bs58.decode(fileBlob.status.uploadInfo.blobId);
    console.log("blobIdArr.length",blobIdArr.length);
    const blobId = uint8ArrayToBigInt(blobIdArr);
    tx.moveCall({
        target:`${config.pkg}::file_blob::add_blob`,
        arguments:[tx.object(config.storage),
            tx.object(profile),
            tx.pure.u256(blobId),
            tx.pure.u256(fileBlob.status.uploadInfo.blobId),
            tx.pure.u32(fileBlob.range.start),
            ]
       
    });
    return tx;
}

export  function getProfile(suiClient :SuiClient, owner :string) : Promise<string | null>{
   return suiClient.getOwnedObjects({
        owner :owner ,
        filter : {
            MoveModule :{ package : config.pkg,
                          module : 'file_blob'
             }
        },
        options:{showType:true}
    }).then( (rsp)=>{
        for(let e of rsp.data){
            console.log('get profile e',e );
            if(e.data && e.data.type == `${config.pkg}::file_blob::Profile`){
                return e.data.objectId
            }
        }
        return null;
    }).catch((reason:any)=>{
        console.log('suiClient.getOwnedObjects error ',reason);
        return null;
    });

}

export  function getCreateProfileTx(){
    const tx = new Transaction();
    tx.moveCall({
        target:`${config.pkg}::file_blob::create_profile`,
        arguments:[tx.object(config.storage)]
    })
    tx.setGasBudget(1e7);
    return tx;
} 

/**
 * //=================events ====================
public struct ProfileCreated has copy,drop{
    profile_address : address,
    sender : address
}
export const ResourceStruct = bcs.struct("Resource", {
    path: bcs.string(),
    headers: bcs.map(bcs.string(), bcs.string()),
    blob_id: BLOB_ID,
    blob_hash: DATA_HASH,
    range: OptionalRangeStruct,
});
 */


export function getProfileFromEffect(rsp : SuiTransactionBlockResponse) : string | null{
    if(rsp.events){
        for(let e of rsp.events){
            console.log("getProfileFromEffect e=",e);
            if(e.type ==  `${config.pkg}::file_blob::ProfileCreated`){
                console.log(e);
                if(e.bcsEncoding == 'base64'){
                    return ProfileCreated.parse( fromBase64(e.bcs)).profile_address
                } else {
                    return ProfileCreated.parse( fromBase58(e.bcs)).profile_address
                }
            }
        }
    }
    return null;
}



/**
public struct FileBlob has copy,drop{
    file_id : u256,
    blob_id : u256,
    start : u32,
    end : u32,
    mime_type : u8,
}
*/

function getCost(gasUsed:GasCostSummary) : bigint{
    return BigInt(gasUsed.computationCost) + BigInt(gasUsed.storageCost)    - BigInt(gasUsed.storageRebate);
}

async function dryrun(suiClient : SuiClient,tx : Transaction){
    const txBytes = await tx.build({ client: suiClient });
    let resp = await suiClient.dryRunTransactionBlock({
        transactionBlock: txBytes,
    });
    
    if (resp.effects.status.status !== "success") {
        console.log(resp.effects);
        return undefined;
    }

    console.log('gas cost:', getCost(resp.effects.gasUsed));
    console.log('dry run resp',resp);
}


/*
public struct FileBlobCreated has copy,drop{
    file_blob : FileBlob,
    sender : address
}

 * @param suiClient
 */
export async  function queryFileBobInfo(suiClient:SuiClient, profileId:string,sender : string){
     const tx = new Transaction();
     tx.moveCall({
        target : `${config.pkg}::file_blob::get_file_blob`,
        arguments : [tx.object(profileId)]
     })
     const rsp = await suiClient.devInspectTransactionBlock({transactionBlock: tx, sender : sender});
     console.log('queryFileBlobInfo rsp',rsp);
     if(rsp.effects && rsp.effects.status.status == 'success'  && rsp.results){
        
        for (let [i,r] of  rsp.results.entries()){
            if(!r.returnValues){
                continue;
            }
            for(let rv of r.returnValues){
                console.log(`return values of ${i} arr and string`,rv[0], rv[1]);
            }
        }
     }


    await dryrun(suiClient,tx);
    
}