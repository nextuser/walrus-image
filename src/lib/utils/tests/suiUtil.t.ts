import { getSigner } from "./local_key";
import {getProfileId, getCreateProfileTx} from "../suiUtil"
import { getServerSideSuiClient } from "./suiClient";
import { Keypair } from "@mysten/sui/cryptography";
import config from "@/config/config.json";
import { SuiClient } from "@mysten/sui/client";
import {getProfile} from '@/lib/utils/suiUtil'
const suiClient = getServerSideSuiClient();
const signer = getSigner();
const sender = signer.getPublicKey().toSuiAddress();

async function  test_profile(){
    const profile = await getProfileId(suiClient,'0xafe36044ef56d22494bfe6231e78dd128f097693f2d974761ee4d649e61f5fa2');
    console.log('test_profile result',profile);
}
async function test_profile_null(){
    const addr ='0xebb49dad8eae5f8cf9e55fbb02c1addd54415ac1d4422f8b47cb898bfbdc49f8'
    const profile = await getProfileId(suiClient,addr);
    console.log('test profile_null:',profile,'for owner:',addr)
}




// async function test_file_blob(){
//     let profile = await getProfile(suiClient,sender);
//     if(profile == null){
//         console.log('no profile,begin to create profile');
//         profile = await createProfile(suiClient,signer);
//     }
    
//     if(profile == null){
//         console.log('create profile fail');
//         return ;
//     }

//     console.log(signer.getPublicKey().toSuiAddress());
//     queryFileBobInfo(suiClient,profile,sender);
// }


async function test_file_info_objects(){
    let profile = await getProfileId(suiClient,sender);
   
    if(profile == null){
        console.log('find  profile fail');
        return ;
    }

    console.log(signer.getPublicKey().toSuiAddress());
}
//test_file_info_objects();
//test_file_blob();


//test_create_profile()

//test_profile();

import { queryFileDataEvents } from "../suiUtil";
function test_query(){
    const events = queryFileDataEvents(suiClient);
    events.then((value) => console.log(value.fileDatas.length))
}

test_query();
//test_profile_null();