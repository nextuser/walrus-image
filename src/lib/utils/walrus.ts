import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';
import { useCurrentWallet,useCurrentAccount } from '@mysten/dapp-kit';

type WalrusConfig = {
    env : 'testnet' | 'mainnet',
    packageConfig :{
        systemObjectId : string,
        stakingPoolId : string,
    }
}

const testnet_config :WalrusConfig = {
    env : 'testnet',
	packageConfig: {
		systemObjectId: '0x6c2547cbbc38025cf3adac45f63cb0a8d12ecf777cdc75a4971612bf97fdf6af',
		stakingPoolId: '0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3',
	},
}

const mainnet_config : WalrusConfig = {
    env : 'mainnet',
	packageConfig: {
		systemObjectId: '0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2',
		stakingPoolId: '0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904',
	},
}


/**
 *   mainnet:
    system_object: 0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2
    staking_object: 0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904
    subsidies_object: 0xb606eb177899edc2130c93bf65985af7ec959a2755dc126c953755e59324209e
    exchange_objects: []
    wallet_config:
      path: ~/.sui/sui_config/client.yaml
      active_env: mainnet
  testnet:
    system_object: 0x6c2547cbbc38025cf3adac45f63cb0a8d12ecf777cdc75a4971612bf97fdf6af
    staking_object: 0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3
    subsidies_object: 0xda799d85db0429765c8291c594d334349ef5bc09220e79ad397b30106161a0af
 */

import path from 'path'
import { Signer } from '@mysten/sui/cryptography';

const suiClient = new SuiClient({
	url: getFullnodeUrl('testnet'),
});

const walrusWasmUrl = path.join(process.cwd() ,'wasm/walrus_wasm_bg.wasm');
const walrusClient = new WalrusClient({
    //suiClient : suiClient,
    packageConfig : testnet_config.packageConfig,
	suiRpcUrl:getFullnodeUrl('testnet'),
    wasmUrl:walrusWasmUrl
});

async function test(){
    const  obj = await suiClient.getObject({
        id : '0x6c2547cbbc38025cf3adac45f63cb0a8d12ecf777cdc75a4971612bf97fdf6af',
        options : { showContent:true}
    });
    console.log('obj:',obj);
    const blob = await walrusClient.readBlob({blobId:'x7iJ5JT1Nd1Stycd7x0ipj0-2vzCuz3B2hskVEX7bE4'});
    const wallet = useCurrentWallet();
    let signer:Signer;
    
    // if(wallet.isConnected){
    //     signer = wallet.currentWallet;
    
    //     let account = useCurrentAccount()?.address;
    //     walrusClient.writeBlob({
    //         blob,
    //         deletable : false,
    //         epochs : 2,
    //         signer:null,
    //         owner: account
    //     })
    // }
    console.log("blob:",blob);
}

test();