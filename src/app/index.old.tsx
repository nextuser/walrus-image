import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import type { NextPage } from 'next';

const IndexPage: NextPage = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedHash, setUploadedHash] = useState('');

  const acccepts =  ['image/*'  ];
  const { getRootProps, getInputProps } = useDropzone({
    accept : {'image/*': ['.jpeg', '.png', '.jpg']},
    onDrop: async (acceptedFiles:any) => {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', acceptedFiles[0]);
      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setUploadedHash(response.data.hash);
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      {uploading && <p>Uploading...</p>}
      {uploadedHash && <p>Uploaded file hash: {uploadedHash}</p>}
    </div>
  );
};

export default IndexPage;
    
