import { PaginatedEvents, SuiClient,EventId } from "@mysten/sui/client";
import { SuiTransactionBlockResponse ,    DryRunTransactionBlockResponse} from '@mysten/sui/client'
import { FileInfo, UploadStatus ,WalrusInfo} from "./types";
import { Transaction,TransactionArgument ,TransactionObjectArgument} from "@mysten/sui/transactions";
import config from '@/config/config.json'
import { fromBase64, toBase64,fromBase58, toHex } from "@mysten/sui/utils";
import * as parser from "./suiParser";
import { GasCostSummary } from "@mysten/sui/client";
import { ContentType } from "./content";
import * as sp from "./suiParser";
import { bcs } from "@mysten/bcs";

import { u256_to_blobId,u256_to_hash,
         hash_to_u256,blobId_to_u256 
        } from "@/lib/utils/convert";
import { Keypair } from "@mysten/sui/cryptography";
import { FileBlobAddResult,Profile,
        DynamicField,Struct,Address } from "./suiTypes";
/**
 * 
entry fun add_file(storage : &mut Storage,
                    owner : address,
                    file_id :String,
                    mime_type : u8,
                    size : u32,
                    ctx : & mut TxContext)
 */

export  function getAddFileTx(owner :string,file_id : string,mime_type : number, size :number){
    console.log(`file_blob::add_file( storage, owner: ${owner}, file:${file_id})`);
    const tx = new Transaction();
    tx.moveCall({
        target:`${config.pkg}::file_blob::add_file`,
        arguments:[tx.object(config.storage),
            tx.pure.address(owner),
            tx.pure.string(file_id),
            tx.pure.u8(mime_type),
            tx.pure.u32(size)
        ]
       
    });
    tx.setGasBudget(1e8);
    return tx;
} 

export function getRechargeTx(owner : string,amount_mist : number ){
    const tx = new Transaction();
    console.log(`file_blob::recharge(${config.storage}, ${owner}`)
    let new_coin = tx.splitCoins(tx.gas,[amount_mist]);
    tx.moveCall({
        target:`${config.pkg}::file_blob::recharge`,
        arguments:[tx.object(config.storage),tx.pure.address(owner), new_coin]
    })
    tx.setGasBudget(2e6);
    return tx;
}

// export async function getRecentBlobs(sc : SuiClient){
//     const eventType = `${config.pkg}::file_blob::FileBlobAddResult`;
//     let rsp = await sc.queryEvents({
//         query:{
//             MoveEventType : eventType
//         },
//         order :'descending',
    
//     })
//     let blobs : FileBlob[] = [];
//     for(let e of rsp.data){
//         if(e.type == eventType){
//             let r = e.parsedJson as FileBlobAddResult
//             for(let b of r.blobs){
//                 blobs.push(b);
//             }
//         }
//     }
//     console.log( 'file blobs ', blobs);
//     return blobs
// }


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

//  export function getAddBlobTx( blobIdStr :string,fileBlobs: FileBlobInfo[]) : Transaction | null{
//     const tx = new Transaction();
//     const file_ids:TransactionObjectArgument[] = [];
//     const owners : TransactionObjectArgument[] = [];
//     const starts:TransactionObjectArgument[] = [];
//     const ends:TransactionObjectArgument[] = [];
//     const mime_types:TransactionObjectArgument[] = [];
//     for(let fileBlob of fileBlobs){
//         const file_id = hash_to_u256(fileBlob.hash)
//         console.log('file_id',file_id);
//         file_ids.push(tx.pure.u256(file_id));
//         starts.push(tx.pure.u32(fileBlob.range.start));
//         ends.push(tx.pure.u32(fileBlob.range.end));
//         mime_types.push(tx.pure.u8(fileBlob.contentType));
//     }
    
//     const blobId = blobId_to_u256(blobIdStr);
//     console.log('blobId', blobId,' from ',blobIdStr);
//     tx.moveCall({
//         target:`${config.pkg}::file_blob::add_file_blob`,
//         arguments:[
//             tx.object(config.storage),//Storage
//             tx.pure.u256(blobId),//blob_id
//             tx.makeMoveVec({ type:'u256', elements: file_ids}),
//             tx.makeMoveVec({ type:'u8',elements: mime_types}),//mime_types
//             tx.makeMoveVec({ type:'u32',elements: starts}),//starts
//             tx.makeMoveVec({ type:'u32',elements: ends})//ends
//             ]
//     });

//     tx.setGasBudget(1e8);
//     return tx;
// }

export function calcuate_fee(  config : parser.FeeConfigType, size : number) : number{
    let kbs = size >> 10;
    return Number(config.contract_cost) + Number(config.contract_fee)  + kbs * Number(config.wal_per_kb) * Number(config.price_wal_to_sui_1000) /1000 
}

export async function  getStorage(sc:SuiClient) : Promise<parser.StorageType | undefined>{
    const obj = await sc.getObject({ id : config.storage,options:{showContent:true,showBcs:true}});

    if(obj.data?.bcs?.dataType == 'moveObject'){
        console.log('parse bcs');
        let st = parser.Storage.parse(fromBase64(obj.data.bcs.bcsBytes))
        //console.log("storage",st);
        //console.log("storage profile_map.id",st.profile_map.id.id as unknown )
        //console.log("storage file_map.id",st.file_blob_map.id.id as unknown )
        //console.log(st.balance.value,st.feeConfig.contract_image_fee, st.feeConfig.contract_walrus_fee, st.feeConfig.walrus_kb_fee);
        return st;
    }

}

export function isBalanceEnough(storage:parser.StorageType,profile:Profile , size : number){
   let fee = calcuate_fee(storage.feeConfig, size)
   return Number(profile.balance) >= fee;
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

export async function  getProfileId(suiClient :SuiClient, owner :string) : Promise<string | undefined>{
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



// export async function getFileBlobsFor(suiClient : SuiClient,
//                                 owner:string): Promise<parser.FileBlobType[]>{
                                
//     const tx = new Transaction();
//     tx.moveCall({
//         target : `${config.pkg}::file_blob::get_file_blobs`,
//         arguments: [tx.object(config.storage), tx.pure.address(owner)]
//     })
//     tx.setGasBudget(1e8);
//     console.log('file_blob::get_file_blobs for owner',owner);
//     let rsp = await suiClient.devInspectTransactionBlock({transactionBlock:tx, sender : owner});
//     const fb_ids :string[] = [];
//     if(rsp.effects?.status.status == 'success' && rsp.results){
//         for( let result of rsp.results){
//             if(!result.returnValues){
//                 console.log('no returnvalues');
//                 continue;
//             } 
//             for(let rv of result.returnValues){
//                 console.log('rv ',rv[0]);
//                 if(rv[0].length == 1 && rv[0][0] == 0){
//                     continue;
//                 }
//                 console.log('type:',rv[1]);
//                 let ret = parser.Vector_Address.parse(new Uint8Array(rv[0]));
//                 for(let a of ret){
//                     if(fb_ids.indexOf(a) == -1){
//                         fb_ids.push(a);
//                     }
//                 }
//             }
//         }
//     }
//     console.log('get object ids ',fb_ids);
//     if(fb_ids.length == 0){
//         console.log('get profile images ids', rsp);
//         return []; 
//     }
//     return getFileObjectsByIds(suiClient,fb_ids);
// }

// async function getFileObjectsByIds(suiClient:SuiClient,fb_ids : string[]): Promise<parser.FileBlobType[]>{
//     let objectRsps = await suiClient.multiGetObjects({
//         ids:fb_ids,
//         options:{showBcs:true}
//     })
//     let fbs : parser.FileBlobType[] = [];
//     for(let o of objectRsps){
//         if(o.data?.bcs?.dataType == 'moveObject'){
//             let fbo = parser.FileBlobObject.parse(fromBase64(o.data.bcs.bcsBytes)).file_blob;
//             fbs.push(fbo);
//         }
//     }
//     return fbs;
// }


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
export  function getCreateProfileTx(amount_mist : bigint ,vault_id : string) : Transaction|null{
    if(amount_mist < PROFILE_CREATE_COST){
        console.log(`arg amout_mist invalid,less than ${PROFILE_CREATE_COST}`);
        return null;
    };
    const tx = new Transaction();
    console.log("getCreateProfileTx amount,vault_id",amount_mist,vault_id);
    let new_coin = tx.splitCoins(tx.gas,[amount_mist]);
    tx.moveCall({
        target:`${config.pkg}::file_blob::create_profile`,
        arguments:[tx.object(config.storage),new_coin, tx.pure.string(vault_id)]
    })
    tx.setGasBudget(1e7);
    return tx;
} 



export  function getWithdrawTx() : Transaction{

    const tx = new Transaction();
    tx.moveCall({
        target:`${config.pkg}::file_blob::withdraw`,
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


/**
 * 添加File  , 在server 端
 */
export async function addFile(suiClient : SuiClient,signer: Keypair,
                            owner: string, file_id : string ,
                            contentType : number,size : number): Promise<bigint>{
    if(signer.getPublicKey().toSuiAddress() != config.operator){
        console.error('operator error: ',config.operator, ' manager:',signer.getPublicKey().toSuiAddress);
        return 0n;
    }
    let tx = getAddFileTx(owner ,file_id,contentType,size);
    const rsp = await suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer : signer,
        options:{showEffects: true}
    });
    
    if(rsp.effects?.status.status == 'success'){
        const cost =  getCost(rsp.effects.gasUsed);
        console.log('addFile  success,gas cost',Number(cost)/1e9);
        return cost;
    } else{
        console.log('addFile failed,digest:',rsp.digest, ',rsp:',rsp)
    }
    return 0n;
}


/**
 * 添加 FielBlobObject  在服
 * 后台任务task.ts  storage.manager 执行
 */
// export async function addFileBlob(suiClient:SuiClient,blobId:string,blobs :FileBlobInfo[],signer :Keypair){
    
//     let tx = getAddBlobTx(blobId,blobs);
//     if(!tx){
//         console.error('get tx failed ');
//         return;
//     }
//     return suiClient.signAndExecuteTransaction({
//         transaction:tx,
//         signer,
//         options:{showEvents:true,showEffects:true}
//     }).then((rsp)=>{
//         if(rsp.effects?.status?.status == 'success' ){
//             const gasCost = getCost(rsp.effects.gasUsed);
//             console.log('addFileBlob succ  :cost=',Number(gasCost)/1e9);

//             if(!rsp.events){
//                 console.log('addFileBlob no event ');
//                 return gasCost;
//             }
//             for(let e of rsp.events){
//                 if(e.type == `${config.pkg}::file_blob::FileBlobAddResult`){
//                    let result =  e.parsedJson as FileBlobAddResult;
//                    if(result.fbo_ids.length > 0){
//                     console.log(`filblob add  sender ${signer.getPublicKey().toSuiAddress()},fbo id :${result.fbo_ids[0]}`);
//                    }
//                 }
//                 console.log('event content :',e.type, e.parsedJson );
//             }   
//             return gasCost;
//         } else{
//             console.error('fail to addFileBlob',rsp);
//             return 0n;
//         }
//     })
// }

/*

public fun get_file_blobs(profile : &Profile)  
 * @param suiClient
 */
// export async  function queryFileBobInfo(suiClient:SuiClient, profileId:string,sender : string){

//      let obj = await suiClient.getObject({
//        id :profileId,
//        options:{showBcs:true,showContent:true}
//      })
//      const ids : string[] = []; 
//      console.log(obj);
//      if(obj.data && obj.data.bcs && obj.data.bcs.dataType == 'moveObject'){
//         let p = sp.Profile.parse(fromBase64(obj.data.bcs.bcsBytes))
//         console.log('begin parse');
//         let blobs = p.file_ids;
//         blobs.forEach((id)=> ids.push(id));
//      }
     
//      if(obj.data && obj.data.content && obj.data.content.dataType == 'moveObject'){
//         console.log('fileBlobInfo fields',obj.data.content.fields);
//      }
//      console.log('blob ids:',ids);
//      let objs = await suiClient.multiGetObjects({ids})
//      for(let blobRsp of objs){
//         if(blobRsp.data && blobRsp.data.bcs && blobRsp.data.bcs.dataType == 'moveObject'){
//             let o = parser.FileBlobObject.parse(fromBase64(blobRsp.data.bcs.bcsBytes))
//             console.log('file blob',o.file_blob.blob_id, o.file_blob);
//         }
//      }
// }

// export async function getFileBlobs(suiClient: SuiClient,file_ids : string[]){
//     let objs = await suiClient.multiGetObjects({ids})
//     let result = [];
//     for(let blobRsp of objs){
//        if(blobRsp.data && blobRsp.data.bcs && blobRsp.data.bcs.dataType == 'moveObject'){
//            let o = parser.FileBlobObject.parse(fromBase64(blobRsp.data.bcs.bcsBytes))
//            console.log('getFileBlobs: file blob',o.file_blob.blob_id, o.file_blob);
//            result.push(o.file_blob);
//        }
//     }
//     return result;
// }

export async function getProfile(sc : SuiClient, 
                                parentId : string, 
                                owner : string) : Promise<Profile|null>
{
    const rsp = await sc.getDynamicFieldObject({
        parentId,
        name : {
            type:'address',
            value: owner
        }
    });
    //console.log('profile dynamic field',rsp);
    if( rsp.data?.content?.dataType == 'moveObject'){
        
        const f = rsp.data.content.fields as unknown as DynamicField<Address,Struct<Profile>>;
        console.log("getDynamicProfile:profile fields",f.id.id,f.value.fields.balance, f.value.fields.file_ids, f.value.fields.vault_id);
        console.log("vault_id", f.value.fields.vault_id);
        return f.value.fields;
    } else{
        console.log('no data for owner:',owner);
        return null;
    }
    
}
 /*  
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
   
}*/

import { FileData , FileAdded} from "./types";
import { FileAddedType } from "./suiParser";
import { resourceLimits } from "worker_threads";
export type Cursor = EventId|undefined|null
export type FileDataEvents  ={
    fileDatas : FileData[];
    cursors : Cursor[];
    cursorIndex : number;
}

export function hasNext(events :FileDataEvents){
    return events.cursors.length > events.cursorIndex
}

export function emptyFileDataEvents() : FileDataEvents{
    return { fileDatas:[],cursors : [], cursorIndex : -1 }
}

export async function  queryFileDataEvents(sc : SuiClient, next:boolean = true,previous ? : FileDataEvents, ) : Promise<FileDataEvents>{
    const   result = emptyFileDataEvents();
    if(!sc) {
        return  result
    }
    
    // let result :FileDataEvents = emptyFileBlobEvents();
    let cursor = undefined;
    if(previous ){
        let index = next ?  previous.cursorIndex  : previous.cursorIndex - 2;
        if(index < previous.cursors.length  && index >= 0){
            cursor = previous.cursors[index]
        }
    }

    
    let events = await sc.queryEvents({query:{MoveEventType:`${config.pkg}::file_blob::FileAdded`},cursor})
   
    const ids : string[] = [];
    for(let e of events.data){
        let r = e.parsedJson as FileAdded;
        console.log('fileadded',r.file_data.vault_id,r.file_data.file_id);
        console.log('FileAdded,event',r);
        result.fileDatas.push(r.file_data);
    }

    if(previous){
        previous.cursors.forEach((value) =>result.cursors.push(value));
        result.cursorIndex = next ? previous.cursorIndex + 1 : previous.cursorIndex - 1;
        
    } else{
        result.cursorIndex = 0;

    }
    if(next && events.hasNextPage){
        result.cursors.push(events.nextCursor)
    }
    

    // let values = await sc.multiGetObjects({ids, options:{showContent:true}})
    // for(let value of values){
    //     //console.log('value',value)
    //     if(value.data?.content?.dataType == 'moveObject'){
    //         console.log('filedata event  fields', value.data.content.fields);
    //         //value.data.content.fields as parser.FileAddedType
           
    //         let fat = value.data.content.fields as FileAddedType;
    //         //console.log('fbo', fbo);
    //         let fd = fat.file_data;
    //         let f :FileData = {
    //             vault_id : fd.vault_id,
    //             file_id : fd.file_id,
    //             owner : fd.owner,
    //             mime_type : fd.mime_type,
    //             size : fd.size,
    //         }
    //         //console.log('addFileBlobInfo',f);
    //         result.fileDatas.push(f);
    //     }
    // }
    return result;
}



