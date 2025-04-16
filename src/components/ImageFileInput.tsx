import { stringify } from 'querystring';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Copy, Trash2 } from "lucide-react";
import { Button } from './ui/button';

export default function ImageFileInput(props:{fileUrl:string, setFileUrl: (url :string)=>void}) {
  const [inputType, setInputType] = useState('file');
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  ///const [fileUrl ,setLogUrl] = useState('');
  const [isOpen,setIsOpen] = useState(false)

  const handleInputTypeChange = (type:'file'|'url') => {
    setInputType(type);
    setFile(null);
    setImageUrl('');
    setPreview('');
  };

  const handleFileChange = (event:any) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUrlChange = (event:any) => {
    const url = event.target.value;
    setImageUrl(url);
    setPreview(url);
  };

  async function uploadFile(file :File|string) :Promise<string | null>{
    try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const uploadUrl = '/api/upload';
        console.log("uploadFile:",uploadUrl);
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          console.log("upload failed " ,response.ok,response.text());
          throw new Error('upload failed');
        }
  
        const result = await response.json();
        console.log('upload success, result =', result);
        return result.url;
      } catch (err) {
        console.log("catch error : ",err);
        setError(err instanceof Error ? err.message : 'upload failed');
      } finally {
        setUploading(false);
      }
      return null;
  }

  const handleSubmit = async () => {
    let arg : File | string;
    if (inputType === 'file' && file) {
      console.log('upload file name:', file);
      arg = file;
    } else if (inputType === 'url' && imageUrl) {
      console.log('handle image url:', imageUrl);
      arg = imageUrl;
    } else {
      alert('sect a local Image or input a image url');
      return;
    }
    let url = (await uploadFile(arg) ) || '';
    props.setFileUrl(url);
    if(url){
      setFile(null);
      setImageUrl('');
      setIsOpen(false)
    }

  };

  return (
    <div className='wx-800'>
    <input type="text" disabled={true} value={props.fileUrl}  className='w-full' /> 
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

      {preview && (
        <div className="mb-6">
          <img src={preview} alt="Preview" className="w-full rounded-lg" />
        </div>
      )}

      <Button
        onClick={handleSubmit}
      >
         {uploading ? 'Uploading...' : 'Upload'}
      </Button>
        <DialogClose />
      </DialogContent>
    </Dialog>


      
    </div>
  );
}