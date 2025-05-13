
import {ContentType} from '@/lib/utils/content'
export interface FileRange {
  start: number;
  end: number;
}
export interface FileInfo {
  file_id : string,
  vault_id : string,
  blob_id? : string,
  content_type : ContentType,
  size : number
}


export interface WalrusInfo {
  blobId: string;
  endEpoch?: number;
  suiRef?: string;
  status?: string;
}

type FileStatus = 'site' | 'walrus' | 'sui'

export   type UploadStatus =   {
  tarfile : string,
  on_walrus : false,
} | {
  on_walrus : true,
  walrus_info : WalrusInfo,
};

// export interface FileBlobInfo{
//     hash : string;
//     status :UploadStatus;
//     contentType : ContentType;
//     range : FileRange;
// }


export interface FileData {
  vault_id : string,
  file_id : string,
  owner : string,
  mime_type : number,
  size : number,
}

// public struct FileDataObject has key,store{
//     id : UID,
//     file_data : FileData
// }

export interface FileAdded {
  file_data : FileData,
  cost : string,
}

export interface FileUrl{
  name : string ,
  url : string,
  type : string,
}

// export function toFileInfo(fbi : FileBlobInfo) : FileInfo{
//   const fileInfo:FileInfo = {
//     hash : fbi.hash,
//     content_type:fbi.contentType,
//     size : fbi.range.end - fbi.range.end
//   }
//   return fileInfo;
// }


