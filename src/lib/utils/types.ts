
import {ContentType} from '@/lib/utils/content'
export interface FileRange {
  start: number;
  end: number;
}

export interface FileBlobInfo{
    blobId : string;
    contentType : ContentType;
    range : FileRange;
}
