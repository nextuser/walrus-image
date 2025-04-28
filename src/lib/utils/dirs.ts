import path from 'path'
export const UPLOAD_DIR = path.join(process.cwd(),'public','uploads');
export const CACHE_DIR = path.join(process.cwd(), 'cache');
export const TAR_DIR = path.join(process.cwd(), 'tars');

export function getUploadFile(fileId:string) :string{
    return path.join(UPLOAD_DIR, fileId);
}


export function getTarFile(tarName:string) :string{
    return path.join(TAR_DIR,tarName);
}