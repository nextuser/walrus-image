
// app/upload/page.tsx
'use client'; // 标记为客户端组件
import Link from 'next/link';
import { useStorage } from "../storage_provider";
import ImageFileUpload from '@/components/ImageFileUpload';
import { useEffect, useState } from 'react';
import { useAccounts, useCurrentAccount ,useCurrentWallet, useSignAndExecuteTransaction} from "@mysten/dapp-kit";
import { StorageType } from '@/lib/utils/suiParser';
import { getProfile, getStorage } from '@/lib/utils/suiUtil'
import { useSuiClient } from '@mysten/dapp-kit';
import { Profile } from '@/lib/utils/suiTypes';
import { Button } from '@/components/ui/button';
import {getCreateProfileTx} from '@/lib/utils/suiUtil';
import config from '@/config/config.json'
import { RechargePanel } from '@/components/RechargePanel';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Plus, Minus } from 'lucide-react';
const MIN_AMOUNT = 1e7;
export default function UploadPage() {
    
    const wallet = useCurrentWallet();
    const acc  = useCurrentAccount();
    const storage = useStorage();
    const [profile,setProfile] = useState<Profile|null|undefined>(undefined);
    const [profile_balance ,setProfileBalance ] = useState(0)
    const [wallet_balance, setWalletBalance] = useState<number|undefined>()
    const [imageCount ,setImgCount  ] = useState(0); 
    const [isOpen, setIsOpen] = useState(false);
    
    const suiClient = useSuiClient();
    const afterUploaded = (url :string) => {
        queryProfile();
    }
    const queryProfile = ()=>{
      if(!storage || !acc){
          return ;
      }
      return getProfile(suiClient,storage.profile_map.id.id.bytes, acc.address).then((p)=>{
          setProfile(p);
          setProfileBalance(p ? Number(p.balance) : 0)
          if(p){
            setImgCount(p.file_ids.length);
          }
          return p;
      })
    };

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
            return ;
        }
      }  

      if(profile){
        console.log('profileId:',profile.id.id);
      }

      const afterCharge = (value:number)=>{
        queryProfile();
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

    if(profile === undefined){
        return <div><h2>Loading</h2></div>
    }

    return (
    <div>{(profile === null) && <Button onClick={createProfile}>create profile</Button>}
        { profile &&      <label>Profile Balance: {Number(profile_balance)/1e9} SUI</label>} <br/>
        {wallet_balance &&<label>Wallet  Balance: {wallet_balance/1e9} SUI</label> }<br/>
        <label>Image Count : {imageCount}</label>
        { (!(wallet_balance === undefined ) && profile) && 
        

        <div className="justify-start mx-auto mt-10">
            <Collapsible  defaultOpen={false} onOpenChange={(open) => setIsOpen(open)}>
                <CollapsibleTrigger className="w-full bg-gray-100 p-3 flex justify-between items-center text-left">
                    <div className='underline text-blue-600 hover:text-blue-800 flex justify-start items-center'>{isOpen ? <Minus className="h-4 w-4 p-4" /> : <Plus className="h-4 w-4 p-4" />}Recharge</div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-3 border border-t-0 border-gray-200">
                    <RechargePanel owner={acc.address} min={MIN_AMOUNT}  max={wallet_balance} onCharged = {afterCharge}/>
                </CollapsibleContent>
            </Collapsible>
        </div>
        }
        <div>
        {imagesByUrl && <Link href = {imagesByUrl} className="underline text-blue-600 hover:text-blue-800">My Images</Link>}
        </div>


    </div>)

}

