import { getServerSideSuiClient } from "../utils/tests/suiClient"
import { getVaultName } from "./tusky_common";
import { getServerTusky } from "./tusky_server" 
async function test (){

    const owner ='0x5e23b1067c479185a2d6f3e358e4c82086032a171916f85dc9783226d7d504de'
    const tusky = getServerTusky();
    let name = getVaultName(owner);
    const vault_id = await tusky.vault.create(name,{encrypted:false})
    console.log('vault id ',vault_id)
}

test();