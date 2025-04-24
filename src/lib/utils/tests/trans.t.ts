import { getSigner } from "./local_key";
import {getProfileId, getCreateProfileTx } from "../suiUtil"
import { Keypair,  } from "@mysten/sui/cryptography";
import config from "@/config/config.json";
import { MoveStruct, SuiClient } from "@mysten/sui/client";
import { getServerSideSuiClient } from "./suiClient";
import { FileBlobInfo } from "../types";
import { getLocalSigner } from "./local_key";
import { ProfileCreated ,DynamicField,Profile,Address,Struct,FileBlobAddResult,FileBlob} from "../suiTypes";
import { getRecentBlobs ,getFileBlobsFor,calcuate_fee,getProfile,addFile,addFileBlob,getStorage} from "../suiUtil";

const sc = getServerSideSuiClient();
const manager = getSigner();
const client = getLocalSigner();
const client_addr = client.getPublicKey().toSuiAddress();

// async function getDynamicProfile(sc : SuiClient, 
//                                 parentId : string, 
//                                 owner : string) : Promise<Profile|undefined>{
//     const rsp = await sc.getDynamicFieldObject({
//         parentId,
//         name : {
//             type:'address',
//             value: owner
//         }
//     });
//     //console.log('profile dynamic field',rsp);
//     if( rsp.data?.content?.dataType == 'moveObject'){
//         const f = rsp.data.content.fields as unknown as DynamicField<Address,Struct<Profile>>;
//         console.log("getDynamicProfile:profile fields",f.id.id,f.value.fields.balance, f.value.fields.file_ids);
//         return f.value.fields;
//     } else{
//         console.log('no data for owner:',owner);
//     }
// }


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
    if(tx == null){
        return ;
    }
    let rsp = await suiClient.signAndExecuteTransaction({transaction:tx,signer:keypair,options:{showEffects:true,showEvents:true}});
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
    // let storage = await getStorage(suiClient);
    // if(storage == null) return;
    //role client 
    let profile = await getProfileId(sc,client_addr);
    
    if(!profile) {
         //role client 
        profile = await createProfile(sc ,1000_000_000n,client);
    }
    
    if(!profile) return;


    let hash =  'abcdefccc015';
    const blobId = 'tuGCqX_5qU-lhyts50TMagm9ZuHkmUVgLEhJHWBf0FE'
    const blob = getTestFileBlobInfo(blobId,hash);
    //role manager
    await addFile(sc,manager,client_addr,hash, blob.range.end - blob.range.start );
    //role manager
    await addFileBlob( sc,blobId,[blob],manager);

    getFileBlobsFor(sc,client_addr);

}


function test_get_storage(){
    getStorage(sc).then((st)=>{
        if(st){
            console.log('storage balance',st.balance.value,'feeConfig=',st.feeConfig);
            const size = 33332;
            const fee = calcuate_fee(st.feeConfig,size);
            console.log('calcuate_fee size of ',size , ' fee is',fee / 1e9);
            getProfile(sc,st.profile_map.id.id.bytes,client_addr)
                .then((v:Profile|undefined)=>{ 
                    if(v){
                        console.log('file_ids', v.file_ids);
                        console.log('get dynamic profile',v.balance)
                    } })
        }
    })
}
//test_all();

getRecentBlobs(sc);

test_get_storage();