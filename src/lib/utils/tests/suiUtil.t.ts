import { getSiteUrl } from "@/lib/utils";
import { getSigner } from "./local_key";
import {getProfile, queryFileBobInfo,getCreateProfileTx} from "../suiUtil"
import { getServerSideSuiClient } from "./suiClient";
import config from "@/config/config.json";

const suiClient = getServerSideSuiClient();
const signer = getSigner();
const sender = signer.getPublicKey().toSuiAddress();

function test_profile(){

}

async function createProfile() : Promise<string | null>{
   console.log('createProfile begin');
   const tx = getCreateProfileTx();
   const rsp = await suiClient.signAndExecuteTransaction({
    transaction:tx,
    signer,
    options:{showEffects:true, showObjectChanges:true}
   });
   console.log('digest',rsp.digest);
   if(rsp.effects && rsp.effects.status.status == 'success' && rsp.objectChanges){
     
     //console.log("createProfile object changes:",rsp.objectChanges);
     for( let o  of rsp.objectChanges){
        if(o.type == 'created' && o.objectType ==`${config.pkg}::file_blob::Profile`){
            return o.objectId;
        }
     }
   }
   console.log("createProfile fail to find profileId,effects:",rsp.effects, ",object changes:",rsp.objectChanges);
   return null;

}
async function test_file_blob(){
    let profile = await getProfile(suiClient,sender);
    if(profile == null){
        console.log('no profile,begin to create profile');
        profile = await createProfile();
    }
    
    if(profile == null){
        console.log('create profile fail');
        return ;
    }

    
    queryFileBobInfo(suiClient,profile,sender);
}


test_file_blob();