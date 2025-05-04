import path from 'path'

const pid = 'walrus-image';//String(process.pid)
export const UPLOAD_DIR = path.join('/tmp',pid,'uploads');
export const CACHE_DIR = path.join('/tmp' ,pid,'cache');
export const TAR_DIR = path.join('/tmp', pid,'tars');

export function getUploadFile(fileId:string) :string{
    return path.join(UPLOAD_DIR, fileId);
}


export function getTarFile(tarName:string) :string{
    return path.join(TAR_DIR,tarName);
}