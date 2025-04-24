import { SuiClient } from "@mysten/sui/client";
import { SuiTransactionBlockResponse ,    DryRunTransactionBlockResponse} from '@mysten/sui/client'
import { FileInfo } from "./types";
import { FileBlobInfo } from "./types";
import { Transaction,TransactionArgument ,TransactionObjectArgument} from "@mysten/sui/transactions";
import config from '@/config/config.json'
import { fromBase64, toBase64,fromBase58, toHex } from "@mysten/sui/utils";
import bs58 from 'bs58';
import { FileBlob,FileBlobObject, ID } from "./suiParser";
import { GasCostSummary } from "@mysten/sui/client";
import { ContentType } from "./content";
import { blobId_to_u256 } from "./convert";
import * as sp from "./suiParser";
import { bcs, toHEX } from "@mysten/bcs";
import { Keypair } from "@mysten/sui/cryptography";
import { hash_to_u256 } from "@/lib/utils/convert";
/**
 * 
entry fun add_file(storage : &mut Storage,
                    owner : address,
                    file_id :u256,
                    size : u32,
                    ctx : & TxContext){
 */

export  function getAddFileTx(owner :string,hash : string,size :number){
    const file_id = hash_to_u256(hash);
    console.log(`file_blob::add_file( storage, owner: ${owner}, file:${file_id})`);
    const tx = new Transaction();
    tx.moveCall({
        target:`${config.pkg}::file_blob::add_file`,
        arguments:[tx.object(config.storage),
            tx.pure.address(owner),
            tx.pure.u256(file_id),
            tx.pure.u32(size)
        ]
       
    });
    tx.setGasBudget(1e8);
    return tx;
} 




/*
entry fun add_file_blob(
            storage : &mut Storage,
            blob_id: u256,
            file_ids : vector<u256>,
            mime_types : vector<u8>,
            starts : vector<u32>,
            ends : vector<u32>,
            ctx : &mut TxContext)
 * @param suiClient 
 * @param owner 
 * @returns 
 */

 export function getAddBlobTx( blobIdStr :string,fileBlobs: FileBlobInfo[]) : Transaction | null{
    const tx = new Transaction();
    const file_ids:TransactionObjectArgument[] = [];
    const owners : TransactionObjectArgument[] = [];
    const starts:TransactionObjectArgument[] = [];
    const ends:TransactionObjectArgument[] = [];
    const mime_types:TransactionObjectArgument[] = [];
    for(let fileBlob of fileBlobs){
        const file_id = hash_to_u256(fileBlob.hash)
        console.log('file_id',file_id);
        file_ids.push(tx.pure.u256(file_id));
        starts.push(tx.pure.u32(fileBlob.range.start));
        ends.push(tx.pure.u32(fileBlob.range.end));
        mime_types.push(tx.pure.u8(fileBlob.contentType));
    }
    
    const blobId = blobId_to_u256(blobIdStr);
    console.log('blobId', blobId,' from ',blobIdStr);
    tx.moveCall({
        target:`${config.pkg}::file_blob::add_file_blob`,
        arguments:[
            tx.object(config.storage),//Storage
            tx.pure.u256(blobId),//blob_id
            tx.makeMoveVec({ type:'u256', elements: file_ids}),
            tx.makeMoveVec({ type:'u8',elements: mime_types}),//mime_types
            tx.makeMoveVec({ type:'u32',elements: starts}),//starts
            tx.makeMoveVec({ type:'u32',elements: ends})//ends
            ]
    });

    tx.setGasBudget(1e8);
    return tx;
}

// export async function createProfile(suiClient:SuiClient,signer : Keypair) : Promise<string | null>{
//    console.log('createProfile begin');
//    const tx = getCreateProfileTx(suiClient,);
//    const rsp = await suiClient.signAndExecuteTransaction({ transaction:tx,signer,options:{showEffects:true,showObjectChanges:true}});
//    console.log('digest',rsp.digest);
//    if(rsp.effects && rsp.effects.status.status == 'success' && rsp.objectChanges){
     
//      //console.log("createProfile object changes:",rsp.objectChanges);
//      for( let o  of rsp.objectChanges){
//         if(o.type == 'created' && o.objectType ==`${config.pkg}::file_blob::Profile`){
//             return o.objectId;
//         }
//      }
//    }
//    console.log("createProfile fail to find profileId,effects:",rsp.effects, ",object changes:",rsp.objectChanges);
//    return null;

// }

export async function  getProfile(suiClient :SuiClient, owner :string) : Promise<string | undefined>{
    const tx = new Transaction();
    tx.setSender(owner);
    tx.moveCall({
        target:`${config.pkg}::file_blob::try_get_profile`,
        arguments:[ tx.object(config.storage),tx.pure.address(owner)]
    });
    tx.setGasBudget(1e7);

    let rsp = await suiClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender:owner,      
    })
    
    if(rsp.effects && rsp.effects.status.status == 'success'  && rsp.results && rsp.results.length> 0){
        let firstResult = rsp.results[0];
        if(firstResult.returnValues && firstResult.returnValues.length > 0){
            let [ values ,  type_name ] = firstResult.returnValues[0];
            if(type_name == '0x1::option::Option<address>'){
                if(values.length == 1 && values[0] == 0){
                    return ;
                } else{
                    let id = '0x' +toHex(new Uint8Array(values));
                    console.log(`owner: ${owner} \n profile: ${id}`);
                    return  id
                }
            }
        }
     } else{
        console.log('get profile error',rsp.effects.status.error)
     }
}


// export  function getProfile(suiClient :SuiClient, owner :string) : Promise<string | null>{
//    return suiClient.getOwnedObjects({
//         owner :owner ,
//         filter : {
//             MoveModule :{ package : config.pkg,
//                           module : 'file_blob'
//              }
//         },
//         options:{showType:true}
//     }).then( (rsp)=>{
//         for(let e of rsp.data){
//             console.log('get profile e',e );
//             if(e.data && e.data.type == `${config.pkg}::file_blob::Profile`){
//                 return e.data.objectId
//             }
//         }
//         return null;
//     }).catch((reason:any)=>{
//         console.log('suiClient.getOwnedObjects error ',reason);
//         return null;
//     });

// }

const PROFILE_CREATE_COST :bigint = 10_000_000n; 
//entry fun create_profile(storage : &mut Storage,coin : Coin<SUI>,ctx :&mut TxContext)
export  function getCreateProfileTx(amount_mist : bigint ) : Transaction|null{
    if(amount_mist < PROFILE_CREATE_COST){
        console.log(`arg amout_mist invalid,less than ${PROFILE_CREATE_COST}`);
        return null;
    };
    const tx = new Transaction();
    let new_coin = tx.splitCoins(tx.gas,[amount_mist]);
    tx.moveCall({
        target:`${config.pkg}::file_blob::create_profile`,
        arguments:[tx.object(config.storage),new_coin]
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


/**
public struct FileBlob has copy,drop{
    file_id : u256,
    blob_id : u256,
    start : u32,
    end : u32,
    mime_type : u8,
}
*/

export function getCost(gasUsed:GasCostSummary) : bigint{
    return BigInt(gasUsed.computationCost) + BigInt(gasUsed.storageCost)    - BigInt(gasUsed.storageRebate);
}

async function dryrun(suiClient : SuiClient,tx : Transaction):Promise<DryRunTransactionBlockResponse>{
    const txBytes = await tx.build({ client: suiClient });
    let resp = await suiClient.dryRunTransactionBlock({
        transactionBlock: txBytes,
    });
    return  resp;
}


/*

public fun get_file_blobs(profile : &Profile)  
 * @param suiClient
 */
export async  function queryFileBobInfo(suiClient:SuiClient, profileId:string,sender : string){

     let obj = await suiClient.getObject({
       id :profileId,
       options:{showBcs:true,showContent:true}
     })
     const ids : string[] = []; 
     console.log(obj);
     if(obj.data && obj.data.bcs && obj.data.bcs.dataType == 'moveObject'){
        let p = sp.Profile.parse(fromBase64(obj.data.bcs.bcsBytes))
        console.log('begin parse');
        let blobs = p.file_ids;
        blobs.forEach((id)=> ids.push(id));
     }
     
     if(obj.data && obj.data.content && obj.data.content.dataType == 'moveObject'){
        console.log('fileBlobInfo fields',obj.data.content.fields);
     }
     console.log('blob ids:',ids);
     let objs = await suiClient.multiGetObjects({ids})
     for(let blobRsp of objs){
        if(blobRsp.data && blobRsp.data.bcs && blobRsp.data.bcs.dataType == 'moveObject'){
            let o = FileBlobObject.parse(fromBase64(blobRsp.data.bcs.bcsBytes))
            console.log('file blob',o.file_blob.blob_id, o.file_blob);
        }
     }

    //  const tx = new Transaction();
    //  tx.moveCall({
    //     target : `${config.pkg}::file_blob::get_file_blobs`,
    //     arguments : [tx.object(profileId)]
    //  })
    //  tx.setSender(sender);
    //  tx.setGasBudget(1e8);
    //  const rsp = await suiClient.devInspectTransactionBlock({transactionBlock: tx, sender : sender});
    //  console.log('queryFileBlobInfo rsp',rsp);
    //  if(rsp.effects && rsp.effects.status.status == 'success'  && rsp.results){
        
    //     for (let [i,r] of  rsp.results.entries()){
    //         if(!r.returnValues){
    //             continue;
    //         }
    //         console.log('rv count:',r.returnValues.length)
            
    //         for(let [j,rv] of  r.returnValues.entries()){
    //             console.log(`results[${i}] returnValues[${j}]`,rv[0],',type:', rv[1]);
    //         }
    //     }
    //  }
    //  console.log('rsp events');
    // for(let e of rsp.events){
    //     console.log(e.parsedJson);
    // }
     


    // let rsp2 = await dryrun(suiClient,tx);

    // console.log('dry run rsp2 2events' ,rsp2);
    // for(let e of rsp2.events){
    //     console.log(e.parsedJson);
    // }

    
}


/*
public struct FileBlobCreated has copy,drop{
    file_blob : FileBlob,
    sender : address
}

 * @param suiClient
 */
// export async  function queryFileInfo(suiClient:SuiClient, profileId:string,sender : string){

//     const tx = new Transaction();
//     tx.moveCall({
//        target : `${config.pkg}::file_blob::get_file_info`,
//        arguments : [tx.object(profileId)]
//     })
//     tx.setGasBudget(1e8);
//     const rsp = await suiClient.devInspectTransactionBlock({transactionBlock: tx, sender : sender});
//     console.log('queryFileInfo rsp',rsp);
//     if(rsp.effects && rsp.effects.status.status == 'success'  && rsp.results){
       
//        for (let [i,r] of  rsp.results.entries()){
//            if(!r.returnValues){
//                continue;
//            }
//            for(let rv of r.returnValues){
//                console.log(`return values of ${i} arr and string`,rv[0], rv[1]);
//            }
//        }
//     }


//    await dryrun(suiClient,tx);
   
// }


export async  function queryFileInfoObjects(suiClient:SuiClient, profileId:string,sender : string){

    return suiClient.getObject({
        id : profileId,
        options:{
            showContent:true,
            showBcs:true,
            
        }
    }).then((value )=>{

        if(value.data && value.data.content && value.data.content.dataType == 'moveObject'){
            console.log('file object of ',profileId);
            console.log('content fields',value.data.content.fields);
            console.log('bcs:', value.data.bcs);
        }
    })
   
}