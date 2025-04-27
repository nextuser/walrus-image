// app/upload/page.tsx
'use client'; // 标记为客户端组件
import Link from 'next/link';
import ImageFileUpload from '@/components/ImageFileUpload';
import { useEffect, useState } from 'react';
import { useCurrentAccount ,useCurrentWallet, useSignAndExecuteTransaction} from "@mysten/dapp-kit";
import { StorageType } from '@/lib/utils/suiParser';
import { getProfile, getStorage } from '@/lib/utils/suiUtil'
import { useSuiClient } from '@mysten/dapp-kit';
import { Profile } from '@/lib/utils/suiTypes';
import { Button } from '@/components/ui/button';
import {getCreateProfileTx} from '@/lib/utils/suiUtil';
import config from '@/config/config.json'

export default function UploadPage() {
    
    const [imageUrl ,setImageUrl ] = useState('');
    const wallet = useCurrentWallet();
    const acc  = useCurrentAccount();

    
    const [storage , setStorage ] = useState<StorageType>();
    const [profile,setProfile] = useState<Profile|null>();
    const [profile_balance ,setProfileBalance ] = useState(0)
    const [wallet_balance, setWalletBalance] = useState<number|undefined>()

    const suiClient = useSuiClient();
    const afterUploaded = (url :string) => {
        setImageUrl(url)
        queryProfile();
    }
    const queryProfile = ()=>{
      if(!storage || !acc){
          return ;
      }
      return getProfile(suiClient,storage.profile_map.id.id.bytes, acc.address).then((p)=>{
          setProfile(p);
          setProfileBalance(p ? Number(p.balance) : 0)
          return p;
      })
    };

    useEffect(()=>{
        getStorage(suiClient).then((st)=>{
            setStorage(st);
        })
    },[])
    useEffect(()=>{
        queryProfile();
        if(!acc) {
            setWalletBalance(undefined); 
            return
        };
        suiClient.getBalance({owner:acc.address}).then((b)=> setWalletBalance(Number(b.totalBalance)));
    },[acc,storage])

    let imagesByUrl = "";
    if(acc){
        imagesByUrl = `/images_by/${encodeURIComponent(acc.address)}`
    }


    const create_profile_callback = {
        onSuccess: async (result:any) => {
            console.log('create_profile_callback  success result',result);
            const rsp =  await suiClient.waitForTransaction({ 
              digest: result.digest,
              options: {showEffects:true, showEvents:true, showObjectChanges:true} })
            if(rsp.effects && rsp.effects.status.status == 'success' && rsp.objectChanges){
         
              console.log("createProfile after waittransaction object changes:",rsp.objectChanges);
              for( let o  of rsp.objectChanges){
                 if(o.type == 'created' && o.objectType ==`${config.pkg}::file_blob::Profile`){
                     return o.objectId;
                 }
              }
              //profile balance changed
              queryProfile();
            }
            
            console.log('----------create profile onSuccess ,not find ',result);
        },
        onError: (error:any) => {
           console.log('create_profile_callback onError',error);
           return null;
        },
        onSettled: async (result:any) => {                       
            console.log("create_profile_callback onSettled result:",result,',digest:',result.digest);
            return null;
        }
      }  
    const {mutate : signAndExecuteTransaction} = useSignAndExecuteTransaction();
    const createProfile = async function (){
        const tx = getCreateProfileTx(100_000_000n);
        if(!tx) return;
        const ret = await signAndExecuteTransaction({ transaction:tx},create_profile_callback);
        console.log("createProfile ret=",ret);
        return await queryProfile();
    }
    if(!wallet || !wallet.isConnected || !acc){
        return (<div><h2>Connect Wallet first</h2></div>)
    }

    if(!profile){
        return <div><Link href="/profile">Create Profile first</Link></div>
    }
    return (
    <div>{(profile === null) && <Button onClick={createProfile}>create profile</Button>}
        { profile &&      <label>Profile Balance: {Number(profile_balance)/1e9} SUI</label>} <br/>
        {wallet_balance &&<label>Wallet  Balance: {wallet_balance/1e9} SUI</label> }
        <ImageFileUpload 
            fileUrl={imageUrl} setFileUrl = {afterUploaded}  disabled={ !profile  }
            storage={storage} profile={profile} owner={acc.address}/>
        <div>
        {imageUrl && 
        <Link className="text-blue-900 underline hover:no-underline visited:text-blue-300" href={imageUrl}> {imageUrl}</Link>
        }
        </div>
        <div>
        {imagesByUrl && <Link href = {imagesByUrl} className="text-blue-900 underline hover:no-underline visited:text-blue-300">My Images</Link>}
        </div>
    </div>)

}

