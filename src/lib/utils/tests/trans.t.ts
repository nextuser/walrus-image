import { getSiteUrl } from "@/lib/utils";
import { getSigner } from "./local_key";
import {getProfile, queryFileBobInfo,getCreateProfileTx, queryFileInfoObjects, getAddFileTx, getCost, getAddBlobTx} from "../suiUtil"
import { Keypair, Signer } from "@mysten/sui/cryptography";
import config from "@/config/config.json";
import { SuiClient } from "@mysten/sui/client";
import { getServerSideSuiClient } from "./suiClient";
import { transcode } from "buffer";
import { ProfileCreated ,FileBlobAddResult,FileBlob} from "../suiParser";
import { FileBlobInfo } from "../types";
import { Transaction } from "@mysten/sui/transactions";
import { bcs, fromBase64, toHex } from "@mysten/bcs";
import { u256_to_blobId,u256_to_hash,hash_to_u256,blobId_to_u256, } from "../convert";
import { FileInfo } from "../types";
import { getLocalSigner } from "./local_key";
import { Vector_Address } from "../suiParser";

const suiClient = getServerSideSuiClient();
const manager = getSigner();
const client = getLocalSigner();
const client_addr = client.getPublicKey().toSuiAddress();

/**
 * 查找当前用户的profile
 *  * 1. 获取当前用户的profile
 * entry fun try_get_profile(storage:&Storage,sender : address) : Option<address>
 */
/**
 * 创建profile,client端 user执行
entry fun create_profile(storage : &mut Storage,coin : Coin<SUI>,ctx :&mut TxContext){
*/
async function createProfile(suiClient : SuiClient,amount : bigint,keypair :Keypair) : Promise<string |undefined>{
    let tx = getCreateProfileTx(amount);
    if(tx ==null){
        return ;
    }
    let rsp = await suiClient.signAndExecuteTransaction({transaction:tx,signer:keypair,options:{showEffects:true,showEvents:true}})
    if(rsp.effects?.status.status == 'success'){
        for(let ev of rsp.events!){
            if(ev.type == `${config.pkg}::file_blob::ProfileCreated`){
                console.log('find type, json',ev.parsedJson as unknown);
               
                let profile = (ev.parsedJson as unknown as ProfileCreated).profile_address
                console.log(`createProfile : owner:${keypair.getPublicKey().toSuiAddress}  profile:${profile}`);
                return profile;
            }
        }
    } else{
        console.error('createProfile  failed,status failed,error: ',rsp.effects?.status.error);
    }
    console.log('fail to create profile,not find profile_address', rsp);
}

// 上传文件,未profile 增加file  , server端operator执行

/**
 * 添加File  , 在server 端
 */
async function addFile(suiClient : SuiClient,hash : string ,size : number): Promise<bigint>{
    if(manager.getPublicKey().toSuiAddress() != config.operator){
        console.log('operator error: ',config.operator, ' manager:',manager.getPublicKey().toSuiAddress);
        return 0n;
    }
    let tx = getAddFileTx(client_addr ,hash,size);
    const rsp = await suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer : manager,
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
 */
async function addFileBlob(blobId:string,blobs :FileBlobInfo[],signer :Keypair){
    
    let tx = getAddBlobTx(blobId,blobs);
    if(!tx){
        console.error('get tx failed ');
        return;
    }
    return suiClient.signAndExecuteTransaction({
        transaction:tx,
        signer,
        options:{showEvents:true,showEffects:true}
    }).then((rsp)=>{
        if(rsp.effects?.status?.status == 'success' ){
            const gasCost = getCost(rsp.effects.gasUsed);
            console.log('addFileBlob succ  :cost=',Number(gasCost)/1e9);

            if(!rsp.events){
                console.log('addFileBlob no event ');
                return gasCost;
            }
            for(let e of rsp.events){
                if(e.type == `${config.pkg}::file_blob::FileBlobAddResult`){
                   let result =  e.parsedJson as FileBlobAddResult;
                   if(result.fbo_ids.length > 0){
                    console.log(`filblob add  sender ${signer.getPublicKey().toSuiAddress()},fbo id :${result.fbo_ids[0]}`);
                   }
                }
                console.log('event content :',e.type, e.parsedJson );
            }   
            return gasCost;
        } else{
            console.error('fail to addFileBlob',rsp);
            return 0n;
        }
    })
}


/**
 * 查看当前用户的图片列表
 * #. 根据
 * 获取FileBlobObject address
 * public fun get_file_blobs(storage : &Storage,profile:&Profile) : vector<address>
 * 
 * # 根据blob 对象地址,找到对象
public struct FileBlob has store,copy,drop{
    file_id : u256,
    blob_id : u256,
    start : u32,
    end : u32,
    mime_type : u8,
}

public struct  FileBlobObject has key{
    id: UID,
    file_blob : FileBlob
} 
 *  */ 
import { FileBlobObject } from "../suiParser";
import { ContentType } from "../content";
import { uploadBlob } from "../blobUtil";
import { sign } from "crypto";
import { stringify } from "querystring";


async function getProfileImages(suiClient : SuiClient,
                                owner:string): Promise<FileBlobInfo[]>{
                                
    const fbs : FileBlobInfo[] = [];
    const tx = new Transaction();
    tx.moveCall({
        target : `${config.pkg}::file_blob::get_file_blobs`,
        arguments: [tx.object(config.storage), tx.pure.address(owner)]
    })
    tx.setGasBudget(1e8);
    console.log('file_blob::get_file_blobs for owner',owner);
    let rsp = await suiClient.devInspectTransactionBlock({transactionBlock:tx, sender : owner});
    const fb_ids :string[] = [];
    if(rsp.effects?.status.status == 'success' && rsp.results){
        for( let result of rsp.results){
            if(!result.returnValues){
                console.log('no returnvalues');
                continue;
            } 
            for(let rv of result.returnValues){
                console.log('rv ',rv[0]);
                if(rv[0].length == 1 && rv[0][0] == 0){
                    continue;
                }
                console.log('type:',rv[1]);
                let ret = Vector_Address.parse(new Uint8Array(rv[0]));
                for(let a of ret){
                    if(fb_ids.indexOf(a) == -1){
                        fb_ids.push(a);
                    }
                }
            }
        }
    }
    console.log('get object ids ',fb_ids);
    if(fb_ids.length == 0){
        
        console.log('get profile images ids', rsp);
        return fbs; 
    }
    let objectRsps = await suiClient.multiGetObjects({
        ids:fb_ids,
        options:{showBcs:true}
    })

    for(let o of objectRsps){
        if(o.data?.bcs?.dataType == 'moveObject'){
            let fbo = FileBlobObject.parse(fromBase64(o.data.bcs.bcsBytes)).file_blob;
            let fb :FileBlobInfo = {
                hash : u256_to_hash(BigInt(fbo.file_id)),
                status :{
                  uploaded : true,
                  uploadInfo : {
                    blobId : u256_to_blobId(BigInt(fbo.blob_id)),
                  }
                },
                contentType:fbo.mime_type ,
                range:{
                  start :fbo.start,
                  end : fbo.end,
                }
            }
            console.log('parse succ fbo ',fbo, ' convert to fb ', fb);
            fbs.push(fb);
        }
    }
    


    return fbs;
}



/**
 * queryEvents
 * public struct FileBlobAddResult has copy,drop{
    blobs : vector<FileBlob>,
    sender : address
}

 */
function queryRecentImages(){

}

function getTestFileBlobInfo(blobId : string, hash : string){
    let fb :FileBlobInfo= {
        hash ,
        status :{
            uploaded : true,
            uploadInfo : {
                blobId 
            }
        },
        contentType : 2,
        range : {
            start : 512,
            end : 49152
        }
    }
    return fb;
}
async function test_all(){
    let profile = await getProfile(suiClient,client_addr);

    if(!profile) {
        profile = await createProfile(suiClient ,1000_000_000n,client);
    }
    if(!profile) return;
    let hash =  'abcdefccc015';
    const blobId = 'tuGCqX_5qU-lhyts50TMagm9ZuHkmUVgLEhJHWBf0FE'
    const blob = getTestFileBlobInfo(blobId,hash);
    await addFile(suiClient,hash, blob.range.end - blob.range.start );
    await addFileBlob( blobId,[blob],manager);

    getProfileImages(suiClient,client_addr);

}

test_all();