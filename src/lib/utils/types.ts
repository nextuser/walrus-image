
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
export interface FileBlobInfo{
    blobId : string;
    contentType : ContentType;
    range : FileRange;
}
