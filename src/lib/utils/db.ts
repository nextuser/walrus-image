// import { FileRange, UploadStatus } from './types';
// import {SuiClient,PaginatedEvents } from '@mysten/sui/client';
// import { FileBlobInfo,WalrusInfo } from './types';
// import {getFs} from '@/lib/utils/globalData';
// import path from 'path';
// import tar from 'tar-stream';
// import { TAR_DIR } from './dirs';
// import {registerFileBobInfo,addFileBlobInfo} from '@/lib/utils/globalData'
// import {uploadBlob} from '@/lib/utils/blobUtil';
// import { log} from '@/lib/utils/logger'
// import { getTarPath } from '../utils';
// import config from '@/config/config.json'
// // import { FileBlobAddResult} from '@/lib/utils/suiTypes'
// // import { FileBlob } from '@/lib/utils/suiTypes';
// import { u256_to_blobId,u256_to_hash } from './convert';
// import * as crypto from 'crypto'
// import { MoveStruct } from '@mysten/sui/client';
// import { getServerSideSuiClient } from './tests/suiClient';
// import { Struct } from '@/lib/utils/suiTypes';

// function moveFile(sourcePath: string, destinationPath: string) :string | undefined{
//   try {
//     const fs = getFs()
//     // 确保目标目录存在
//     const destinationDir = path.dirname(destinationPath);
//     if (!fs.existsSync(destinationDir)) {
//       console.log("moveFile , mkDirSync", destinationDir);
//       fs.mkdirSync(destinationDir, { recursive: true });  
//     }

//     // 移动文件
//     fs.renameSync(sourcePath, destinationPath);
//     console.log(`moveFile ${sourcePath} => ${destinationPath}`);
//     return destinationPath
    
//   } catch (error) {
//     console.error('移动文件时出错:', error);
//     throw error;
//   }
// }

// export async function saveBlob(tarfile :string) : Promise<UploadStatus | null> {
//     const filePath = tarfile;
//      const fs = getFs()
//      let buffer :Buffer;
//      try{
//       let data = fs.readFileSync(filePath);
      
//       if(typeof(data) == 'string') {
//         buffer = Buffer.from(data)
//       } else{
//         buffer = data;
//       }
//     }catch(ex ){
//       console.log('saveBlob read tarfile fail for path:', filePath);
//       return null;
//     }
    
//      return uploadBlob(buffer).then((blobInfo : WalrusInfo)=>{
        
//         let status :UploadStatus = {
//           on_walrus : true,
//           walrus_info : blobInfo
//         }
//         log("saveBlob" ,tarfile,"status:",status);
//         return status
//       }).catch((reason :any)=>{
//         log("saveBlob:upload fail reason:",reason);
//         let status :UploadStatus = {
//           tarfile,
//           on_walrus:false
//         }
//         return status;
//       });
// }
// export  function recordFileBlobInfo (
//     hash : string,
//     contentType:number, 
//     fileRange : FileRange,
//     status : UploadStatus
//   )  :FileBlobInfo
// {
//   let fb :FileBlobInfo = {
//     hash,
//     status,
//     contentType,
//     range : fileRange
//   }
//   //console.log(`saveBlobInfoToDB hash=${hash} fb=${fb}`);
//   registerFileBobInfo(hash,fb);
//   return fb;
  
// }



// export function generateId(length: number = 16): string {
//     // 浏览器和Node.js都支持的crypto API
//     //const cryptoObj = window.crypto || (window as any).msCrypto; // 浏览器
//     const cryptoObj = crypto;
//     // 或者在Node.js中: import * as crypto from 'crypto';
    
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let id = '';
    
//     if (cryptoObj && cryptoObj.getRandomValues) {
//       const randomValues = new Uint32Array(length);
//       cryptoObj.getRandomValues(randomValues);
      
//       for (let i = 0; i < length; i++) {
//         id += chars[randomValues[i] % chars.length];
//       }
//     } else {
//       // 回退方案（不推荐用于安全场景）
//       for (let i = 0; i < length; i++) {
//         id += chars[Math.floor(Math.random() * chars.length)];
//       }
//     }
    
//     return id;
//   }
  

//   export function toFileBlobInfo(fileBlob :FileBlob) : FileBlobInfo{
//     const walrus_info : WalrusInfo = {
//         blobId : u256_to_blobId(BigInt(fileBlob.blob_id)),
//     }
//     const status : UploadStatus ={
//         on_walrus : true,
//         walrus_info 
//     }
//     const fbi : FileBlobInfo = {
//             hash : u256_to_hash(BigInt(fileBlob.file_id)),
//             status ,
//             contentType : fileBlob.mime_type,
//             range : {
//                 start : fileBlob.start,
//                 end : fileBlob.end
//             }
//     }
//     return fbi;
// }


// export async function  initFileBlobs(sc : SuiClient){
//     let cursor = undefined;
//     let events : PaginatedEvents ;
    
//     do {
//         events = await sc.queryEvents({query:{MoveEventType:`${config.pkg}::file_blob::FileBlobAddResult`},cursor})
//         cursor = events.nextCursor
//         for(let e of events.data){
//             let r = e.parsedJson as FileBlobAddResult;
//             console.log('initFielBlobs ,event',r);
//             await sc.multiGetObjects({ids: r.fbo_ids, options:{showContent:true}}).then((values)=>{

//                for(let value of values){
//                   //console.log('value',value)
//                   if(value.data?.content?.dataType == 'moveObject'){
//                       //console.log('initFileBlobs fields', value.data.content.fields);
//                       let fbo = value.data.content.fields as FileBlobObjectType;
//                       //console.log('fbo', fbo);
//                       let fb = (fbo.file_blob as unknown as Struct<FileBlobType>).fields;
//                       let f :FileBlobInfo = {
//                             hash : u256_to_hash(BigInt(fb.file_id)),
//                             status :{
//                               on_walrus : true,
//                               walrus_info : {blobId : u256_to_blobId(BigInt(fb.blob_id))},
//                             },
//                             contentType : fb.mime_type,
//                             range : { start : fb.start, end : fb.end}
//                       }
//                       //console.log('addFileBlobInfo',f);
//                       addFileBlobInfo(f);
//                   }
//                }
//             })
//         }
//     } while(events.hasNextPage)
// }
 