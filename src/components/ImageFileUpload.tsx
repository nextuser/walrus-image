'use client'
import { stringify } from 'querystring';
import { useEffect, useState } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose }
// from "@/components/ui/dialog";
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Copy, Trash2 } from "lucide-react";
import { Button } from './ui/button';
import { useSuiClient,useCurrentAccount } from '@mysten/dapp-kit';
import {  getProfileId, getRechargeTx, isBalanceEnough } from '@/lib/utils/suiUtil';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { FileInfo } from '@/lib/utils/types';
import config from '@/config/config.json'
import { Profile } from '@/lib/utils/suiTypes';
import {StorageType } from '@/lib/utils/suiParser'
import { getProfile,getStorage ,calcuate_fee} from '@/lib/utils/suiUtil';
//import { FileAdded, ProfileCreated } from '@/lib/utils/suiParser';
import {NumberInput} from '@/components/NumberInput'
import { Input } from './ui/input';
import { RechargePanel } from './RechargePanel';
import { useStorage } from '@/app/storage_provider';
import Link from 'next/link'

export default  function ImageFileUpload(
  props:{fileUrl:string, 
        setFileUrl: (url :string)=>void
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
  
  const suiClient = useSuiClient();

  const [recharge_amount , set_recharge_amount] = useState(0);
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

  const storageIntf = useStorage();

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
        if(!storageIntf) return;

        const result = await response.json();
        if(owner){
            // let profile = await getProfile(suiClient,owner)
            // if(profile) setProfileId(profile);
            // console.log('upload success, result =', result);
            const p = props.profile;
            const fileInfo =  result.fileInfo as FileInfo;
            if(p && fileInfo){
              profileUpdate(p,fileInfo.size)
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

  const  profileUpdate = (profile : Profile|null, size : number) => {
    if(!storageIntf || !profile) { 
      return;
    } 
    let neeedFee = calcuate_fee(storageIntf.storage.feeConfig, size)
    let existBalance = Number(profile.balance);
    setLack(  neeedFee - existBalance)
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



  const afterCharged = (v ? :number) => {
    if(!storageIntf){
      return;
    }
    set_recharge_amount(Number(v? v:0))
  }
  

  useEffect(()=>{
    suiClient.getBalance({owner }).then((b)=>{ setBalance(Number(b.totalBalance))})
  },[])

  useEffect(()=>{
    
    if(!storageIntf){
      return;
    }
    getProfile(suiClient,storageIntf.storage.profile_map.id.id.bytes,props.owner)
    .then((profile)=>{
      if(!profile || !imageDataUrl ){
        return ;
      }
      const length = Buffer.from(imageDataUrl).length
      profileUpdate(profile,length);
    })
  },[props.profile, imageDataUrl])

  return (
    <div>
    { error && <p>{error}</p>}
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen} >
   
    <Dialog.Trigger onClick={() => { if(!props.disabled){setIsOpen(true)} } } disabled= {props.disabled}>
          <Dialog.DialogTitle  >
            <p className="bg-blue-300 hover:bg-blue-400 text-gray-800 font-bold py-1 px-2 rounded-2xl mx-3 w-50">
            Upload Image
            </p>
          </Dialog.DialogTitle>
          <Dialog.DialogDescription>
            Select the local image to upload, or enter the image URL
          </Dialog.DialogDescription>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black/70 bg-opacity-60 fixed inset-0" />
      <Dialog.Content
        className="fixed left-30 top-30 bg-white p-8 rounded shadow-lg"
        style={{ zIndex: 1000 }}
      >  
      <div>   
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
        <div className="mb-6 ">
          <img src={imageDataUrl} alt="Preview" className="max-w-[400px] max-h-[400px] object-contain" />
        </div>
      )}
      </div>
      <div>
      <Button className="bg-blue-300 hover:bg-blue-400 text-gray-800 font-bold py-1 px-2 rounded-2xl mx-2 "
        onClick={handleSubmit}
        disabled = {!imageDataUrl  || lack > 0}
      >
       {uploading ? 'Uploading...' : 'Upload'}
      </Button></div>
      {lack > 0 && props.profile &&
      <div>
        <div><label>Need Recharge : {lack/1e9 } SUI</label> </div>
        <div><label>My    Balance : {balance/1e9} SUI</label></div>
        <Link href='/profile?recharge=open'  className="text-blue-900 underline hover:no-underline visited:text-blue-300" >
        Recharge
        </Link>
      </div>}
      <Dialog.Close />
  
      </Dialog.Content>
      </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}