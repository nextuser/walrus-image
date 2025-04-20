import { SuiClient ,getFullnodeUrl} from "@mysten/sui/client";
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

export function getServerSideSuiClient(){
    return suiClient;
}
