import { Tusky } from "@tusky-io/ts-sdk/web";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";

async function page(){
    // Sui wallet extension
    const account = useCurrentAccount();

    if(!account ){
        return;
    }
    const tusky_account = {address : account.address, publicKey: new Uint8Array(account.publicKey)}
    const { mutate: signPersonalMessage } = useSignPersonalMessage();
    const tusky = new Tusky({ wallet: { signPersonalMessage, account : tusky_account} });
    // sign-in to Tusky (this will prompt the wallet & ask for user signature)
    await tusky.auth.signIn();

    //tusky.vault.

}