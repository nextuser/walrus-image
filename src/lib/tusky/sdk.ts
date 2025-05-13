import { Tusky } from "@tusky-io/ts-sdk";
import { getTuskeyApiKey } from "./tusky_server";
// You can generate fresh api key here: https://app.tusky.io/account/api-keys

const tusky = new Tusky({ apiKey:  getTuskeyApiKey()});
export function getVaultId(name : string ) : Promise<string | undefined>{
    return tusky.vault.listAll().then((vaults)=>{
        for(let  [i,v] of vaults.entries()){
            //console.log(i,"vault",v)
            if(v.name == name){
                return v.id
            }
        }
    })
}


getVaultId('image').then(console.log)