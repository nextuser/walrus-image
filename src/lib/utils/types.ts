
import {ContentType} from '@/lib/utils/content'
export interface FileRange {
  start: number;
  end: number;
}
export interface FileInfo {
  hash : string,
  content_type : ContentType,
  size : number
}


export interface UploadedBlobInfo {
  blobId: string;
  endEpoch?: number;
  suiRef?: string;
  status?: string;
}

export   type UploadStatus =   {
  tarfile : string,
  uploaded : false,
} | {
  uploaded : true,
  uploadInfo : UploadedBlobInfo,
};

export interface FileBlobInfo{
    hash : string;
    status :UploadStatus;
    contentType : ContentType;
    range : FileRange;
}



