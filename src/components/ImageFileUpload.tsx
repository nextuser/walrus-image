'use client'
import { stringify } from 'querystring';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose }
from "@/components/ui/dialog";
import { Copy, Trash2 } from "lucide-react";
import { Button } from './ui/button';
import { useSuiClient,useCurrentAccount } from '@mysten/dapp-kit';
import {  getProfileId, getRechargeTx, isBalanceEnough } from '@/lib/utils/suiUtil';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getCreateProfileTx,getAddFileTx } from '@/lib/utils/suiUtil';
import { FileInfo } from '@/lib/utils/types';
import config from '@/config/config.json'
import { Profile } from '@/lib/utils/suiTypes';
import {StorageType } from '@/lib/utils/suiParser'
import { getProfile,getStorage ,calcuate_fee} from '@/lib/utils/suiUtil';
//import { FileAdded, ProfileCreated } from '@/lib/utils/suiParser';
import {NumberInput} from '@/components/NumberInput'
import { Input } from './ui/input';

export default  function ImageFileUpload(
  props:{fileUrl:string, 
        setFileUrl: (url :string)=>void
        storage? :StorageType,
        owner : string,
        disabled : boolean,
        profile? : Profile |null}
      ) {
  const [inputType, setInputType] = useState('file');
  const [file, setFile] = useState<File|null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen,setIsOpen] = useState(false)
  const [imageDataUrl,setImageDataUrl] = useState<string>("");
  const [profileId ,setProfileId] = useState<string|undefined>();
  const [balance , setBalance] = useState(0);
  const [lack , setLack] = useState(0);
  const [recharge_amount , set_recharge_amount] = useState(0);
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction }  = useSignAndExecuteTransaction();
  const owner = props.owner;
  const percents = [0,25,50,75,100];
  // const addFileOnSui = async function(fileInfo : FileInfo ){
  //   const tx = getAddFileTx(props.owner, fileInfo.hash,fileInfo.size);
  //   const ret = await signAndExecuteTransaction({transaction:tx}, add_file_callback);
  //   console.log("addFileOnSui ret:",ret);
  //   return ret;
  // }

  const handleInputTypeChange = (type:'file'|'url') => {
    setInputType(type);
    setFile(null);
    setImageUrl('');
    setPreview('');
  };



  // const add_file_callback = {
  //   onSuccess: async (result:any) => {
  //     console.log("result.digest", result.digest,'effect',result.effect);
  //     const rsp =  await suiClient.waitForTransaction({ digest: result.digest,options: {showEffects:true, showEvents:true} })
  //     if(rsp.effects && rsp.effects.status.status == 'success' && rsp.events){
  //       console.log('add add_file_callback succ');
  //     }else{
  //       console.log('add_file_callback fail ',rsp);
  //     }
        
  //   },
  //   onError: (error:any) => {
  //      console.log('add_file_callback error',error);
  //   },
  //   onSettled: async (result:any) => {                       
  //       console.log("add_file_callback settled");
  //   }
  // }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageDataUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
};
  const MIN_AMOUNT = 1E7;
  const charge_callback = "";
  const rechargeToProfile = async (profileId : string,amount : number) =>{
     amount = amount < MIN_AMOUNT ? MIN_AMOUNT : amount;
     let tx = getRechargeTx(profileId,amount)
     signAndExecuteTransaction({transaction : tx},{
       onSuccess : (result)=>{
         console.log('charge digest ', result.digest);
         console.log('effect ',result.effects)
       },
       onError : (err )=>{
          console.log("fail to recharge",err)
       },
       onSettled :(data,err)=>{
          if(err){
            console.log('rechargeBalance settle error',err);
            return;
          }
          console.log('rechargeBalance settle data ',data );
       }

     });
  }
  async function uploadFile(imageData:string) :Promise<string | undefined>{
    try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', imageData);
        formData.append('owner',owner);
        const uploadUrl = '/api/uploadFile';
        console.log("uploadFile:",uploadUrl);
        if(typeof file == 'string'){
          console.log("upload url ",file);
        }

        const response = await fetch(uploadUrl, {
          method: 'POST',
          mode : 'no-cors',
          body: formData,
        });

  
        if (!response.ok) {
          console.log("upload failed ,!response.ok" ,response.ok);
          await response.text().then((value)=>console.log("upload file response ",value))
          throw new Error('upload failed,!response.ok');
        }
        if(!props.storage) return;

        const result = await response.json();
        if(owner){
            // let profile = await getProfile(suiClient,owner)
            // if(profile) setProfileId(profile);
            // console.log('upload success, result =', result);
            const p = props.profile;
            const fileInfo =  result.fileInfo as FileInfo;
            if(p && fileInfo){
              let neeedFee = calcuate_fee(props.storage.feeConfig, fileInfo.size)
              let existBalance = Number(p.balance);
              setLack(  neeedFee - existBalance)
            }//end if
        }//end if
        return result.url;
      } catch (err) {
        console.log("catch error : ",err);
        setError(err instanceof Error ? err.message : 'upload failed,catch err');
      } finally {
        setUploading(false);
      }
  }


  const handlePreviewUrl = async (url :string) => {
    try {

        if(url.startsWith("data:")){
          console.log("handlePreviewUrl setImageDataUrl");
          setImageDataUrl(url);
        } 
        else{
          console.log("handlePreviewUrl:prepare to fetch url ",url);
          const response = await fetch(url);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
              setImageDataUrl(reader.result as string);
          };
          reader.readAsDataURL(blob);
      }
    } catch (error) {
        console.error('Error fetching image:', error);
    }
};

const rechargeProfile = (e : any)=>{
   if(props.profile) {
      rechargeToProfile(props.profile.id.id ,recharge_amount)
   }
}

const handleUrlChange = (event:any) => {
  const url = event.target.value;
  handlePreviewUrl(url);
  setImageUrl(url);
  //setPreview(url);
};

const handleUploadUrl = async () => {
    if (imageDataUrl) {
        try {
            const response = await fetch('/api/uploadFile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imagecode: imageDataUrl }),
            });
            const result = await response.json();
            console.log('Upload result:', result);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }
};

  const handleSubmit = async () => {
    let arg : File | string;
    let url = (await uploadFile(imageDataUrl) ) || '';
    props.setFileUrl(url);
    if(url){
      setFile(null);
      setImageUrl('');
      setPreview('');
      setIsOpen(false)
      setImageDataUrl('');
    }
  };

  useEffect(()=>{
    suiClient.getBalance({owner }).then((b)=>{ setBalance(Number(b.totalBalance))})
  },[])

  return (
    <div className='wx-800'>

    { error && <p>{error}</p>}
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger onClick={() => { if(!props.disabled){setIsOpen(true)} } } disabled= {props.disabled}>
    <div><p className="bg-primary/80 text-primary-foreground hover:bg-primary/60 border border-input px-4 py-2 rounded-2xl w-full">
    Upload Image
    </p></div>
    </DialogTrigger>
      <DialogContent >
        <DialogHeader>
          <DialogTitle >Upload Image</DialogTitle>
          <DialogDescription>
          Select the local image to upload, or enter the image URL
          </DialogDescription>
        </DialogHeader>
        <div className="mb-6">
        <label className="mr-4">
          <input
            type="radio"
            value="file"
            checked={inputType === 'file'}
            onChange={() => handleInputTypeChange('file')}
            className="mr-2"
          />
          Select Local Image
        </label>
        <label>
          <input
            type="radio"
            value="url"
            checked={inputType === 'url'}
            onChange={() => handleInputTypeChange('url')}
            className="mr-2"
          />
          Input Image Url
        </label>
      </div>

      {inputType === 'file' && (
        <div className="mb-6">
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
        </div>
      )}

      {inputType === 'url' && (
        <div className="mb-6">
          <input
            type="text"
            placeholder={'Please enter the image URL'}
            value = {imageUrl}
            onChange={handleUrlChange}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {imageDataUrl && (
        <div className="mb-6">
          <img src={imageDataUrl} alt="Preview" className="w-full rounded-lg overflow-clip" />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled = {!imageDataUrl && lack > 0}
      >
       {uploading ? 'Uploading...' : 'Upload'}
      </Button>
      {lack > 0 && props.profile &&
      <div>
        <div><label>Need Recharge : {lack/1e9 } SUI</label> </div>
        <div><label>My    Balance : {balance/1e9} SUI</label></div>
        <div className='flex justify-start'>
          <NumberInput 
            name="sellTokenNum"
            min = {lack}
            decimalScale = {9}
            max = {balance}
            value={recharge_amount} 
            onValueChange={(v? :number) => set_recharge_amount(Number(v? v:0))} 
          /> SUI
        </div>
        <div>
          <Input
            name="sliderBar"
            type="range" 
            min={lack}
            max={balance}
            disabled={balance < lack}
            className="px-0 "
            value={recharge_amount} 
            onChange={(e:any) => set_recharge_amount(Number(e.target.value))} 
          />
        </div>
        <div className="quick-buttons mx-2">
          {
            percents.map((p:number)=>{
              const m = Math.floor(p * balance / 100);
              return <Button variant='percent' key={p} disabled={ m < lack} 
                        onClick={() => set_recharge_amount(m)}>{p}%</Button>
            })
          }
        </div>
        <Button onClick={rechargeProfile}  disabled = { recharge_amount >= lack}>
          Recharge 
        </Button>
      </div>}
      <DialogClose />
      </DialogContent>
    </Dialog>


      
    </div>
  );
}