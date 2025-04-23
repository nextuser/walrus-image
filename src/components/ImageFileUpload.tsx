'use client'
import { stringify } from 'querystring';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose }
from "@/components/ui/dialog";
import { Copy, Trash2 } from "lucide-react";
import { Button } from './ui/button';
import { useSuiClient,useCurrentAccount } from '@mysten/dapp-kit';
import {  getProfile } from '@/lib/utils/suiUtil';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getCreateProfileTx,getAddFileTx } from '@/lib/utils/suiUtil';
import { FileInfo } from '@/lib/utils/types';
import config from '@/config/config.json'
//import { FileAdded, ProfileCreated } from '@/lib/utils/suiParser';

export default  function ImageFileUpload(props:{fileUrl:string, setFileUrl: (url :string)=>void}) {
  const [inputType, setInputType] = useState('file');
  const [file, setFile] = useState<File|null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen,setIsOpen] = useState(false)
  const [imageDataUrl,setImageDataUrl] = useState<string>("");
  const [profileId ,setProfileId] = useState<string|undefined>();
  let currentAccount = useCurrentAccount()
  const owner = currentAccount ? currentAccount.address : '';
  let profile = null;
  const suiClient = useSuiClient();


  const { mutate: signAndExecuteTransaction }  = useSignAndExecuteTransaction();
  
  const create_profile_callback = {
    onSuccess: async (result:any) => {
        console.log('create_profile_callback success');
        const rsp =  await suiClient.waitForTransaction({ digest: result.digest,options: {showEffects:true, showObjectChanges:true} })
        if(rsp.effects && rsp.effects.status.status == 'success' && rsp.objectChanges){
     
          //console.log("createProfile object changes:",rsp.objectChanges);
          for( let o  of rsp.objectChanges){
             if(o.type == 'created' && o.objectType ==`${config.pkg}::file_blob::Profile`){
                 setProfileId(o.objectId);
                 return o.objectId;
             }
          }
        }
        console.log('create profile onSuccess ,not find ',result);
    },
    onError: (error:any) => {
       console.log('error',error);
       return null;
    },
    onSettled: async (result:any) => {                       
        console.log("settled result:",result);
        return null;
    }
  }    

  useEffect(()=>{
    if(!currentAccount) return;
    getProfile(suiClient,currentAccount.address).then((id:string|undefined )=>setProfileId(id))
  },[currentAccount])
  const createProfile = async function (){
      const tx = getCreateProfileTx(20_000_000n);
      if(!tx) return;
      const ret = await signAndExecuteTransaction({ transaction:tx},create_profile_callback);
      console.log("createProfile ret=",ret);
      return await getProfile(suiClient,owner);
  }

  const addFileOnSui = async function(profileId : string, fileInfo : FileInfo ){
    const tx = getAddFileTx( fileInfo.hash);
    const ret = await signAndExecuteTransaction({transaction:tx}, add_file_callback);
    console.log("addFileOnSui ret:",ret);
    return ret;
  }

  const handleInputTypeChange = (type:'file'|'url') => {
    setInputType(type);
    setFile(null);
    setImageUrl('');
    setPreview('');
  };

  const handleUrlChange = (event:any) => {
    const url = event.target.value;
    handlePreviewUrl(url);
    setImageUrl(url);
    //setPreview(url);
  };

  const add_file_callback = {
    onSuccess: async (result:any) => {
      console.log("result.digest", result.digest,'effect',result.effect);
      const rsp =  await suiClient.waitForTransaction({ digest: result.digest,options: {showEffects:true, showEvents:true} })
      if(rsp.effects && rsp.effects.status.status == 'success' && rsp.events){
        console.log('add add_file_callback succ');
      }else{
        console.log('add_file_callback fail ',rsp);
      }
        
    },
    onError: (error:any) => {
       console.log('add_file_callback error',error);
    },
    onSettled: async (result:any) => {                       
        console.log("add_file_callback settled");
    }
  }

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

  async function uploadFile(imageData:string) :Promise<string | null>{
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
  
        const result = await response.json();
        if(owner){
            // let profile = await getProfile(suiClient,owner)
            // if(profile) setProfileId(profile);
            // console.log('upload success, result =', result);
            let profile = profileId;
            if(!profile){
              profile = await createProfile();
            }
            if(profile && result.fileInfo as FileInfo){
              console.log('addFile',result.fileInfo);
              addFileOnSui(profile,result.fileInfo as FileInfo);
            }
        }
        return result.url;
      } catch (err) {
        console.log("catch error : ",err);
        setError(err instanceof Error ? err.message : 'upload failed,catch err');
      } finally {
        setUploading(false);
      }
      return null;
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

  return (
    <div className='wx-800'>

    { error && <p>{error}</p>}
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger onClick={() => setIsOpen(true)}>
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
          <img src={imageDataUrl} alt="Preview" className="w-full rounded-lg" />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled = {!imageDataUrl}
      >
       {uploading ? 'Uploading...' : 'Upload'}
      </Button>
        <DialogClose />
      </DialogContent>
    </Dialog>


      
    </div>
  );
}