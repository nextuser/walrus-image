import { promises as fs, unlink } from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { execSync } from 'child_process';
import {saveBlob , recordFileBlobInfo, getHash, moveToTarDir, getTarPath } from './db'; // 假设存在上传和保存信息的函数
import tar from 'tar-stream';
import { FileBlobInfo, FileRange } from './types';
import { UPLOAD_DIR,CACHE_DIR,TAR_DIR } from './dirs';
import { start } from 'repl';
import { getContentTypeByExtType } from './content';
import {log} from '@/lib/utils/logger' 
import { registerToDelete } from './globalData';
import { deleteFiles } from './globalData';
import { getAddBlobTx } from './suiUtil';
import { getSigner } from './tests/local_key';
import { getServerSideSuiClient } from './tests/suiClient';
import { fromBase58 } from '@mysten/bcs';
import { getCost } from './suiUtil';
const suiClient = getServerSideSuiClient();
const SIZE_TOO_LARGE = 10 * 1024 * 1024;
const SIZE_TO_TAR = 100  * 1024;

function getExtName(fileName : string):string | undefined{
   return fileName.split(".").pop();
}

const TIME_WAIT_SECONDS_TO_DELETE = 2*60;//todo 30*60

export async function processFiles() {
  log("processFiles begin");
  const files = await fs.readdir(UPLOAD_DIR);
  let totalSize = 0;
  let selectedFiles = new Set<string>();

  for (const file of files) {
    const filePath = path.join(UPLOAD_DIR, file);
    const stats = await fs.stat(filePath);
    if (totalSize + stats.size < SIZE_TOO_LARGE || totalSize < SIZE_TO_TAR) {
      totalSize += stats.size;
      selectedFiles.add(file);
    }  else{
      break;
    }
  }

  if(totalSize < SIZE_TO_TAR ){
    selectedFiles.clear();
    log("files less than size , exit of process ,less than:",SIZE_TO_TAR);
    return ;
  }

  if (selectedFiles.size > 0) {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    for (const file of selectedFiles) {
      const src = path.join(UPLOAD_DIR, file);
      const dest = path.join(CACHE_DIR, file);
      await fs.copyFile(src, dest);
    }
    await fs.mkdir(TAR_DIR, { recursive: true });
    const tarPath = path.join(TAR_DIR, 'archive.tar');
    const pack = tar.pack();
    const tarStream = createWriteStream(tarPath);
    const fileRanges: { [fileName: string]: FileRange } = {};
    let currentOffset = 0;
    const signer = getSigner();

    for (const file of selectedFiles) {
      
      const filePath = path.join(CACHE_DIR, file);
      const stats = await fs.stat(filePath);
      const fileContent = await fs.readFile(filePath);
      //console.log("buffer of filePath",fileContent);
      const entry = { name: file, size: stats.size };
      pack.entry(entry, fileContent, (err:any) => {
        if (err) {
          console.error(err);
        }
      });
      currentOffset += 512;
      fileRanges[file] = { start: currentOffset , end: currentOffset + stats.size };
      currentOffset += stats.size;
      const left = currentOffset  % 512;
      if(left != 0){
        currentOffset += 512 - left ;//pad到512bytes 
      }
      log(`${fileRanges[file]}`);
      ///currentOffset += stats.size + 512; // 加上文件头大小
    }

    pack.finalize();
    pack.pipe(tarStream);

    await new Promise((resolve, reject) => {
      tarStream.on('finish', ()=>resolve(null));
      tarStream.on('error', reject);
    });
    const tarFile = await moveToTarDir(tarPath);
    const now = new Date().getTime();
    
    
    const status = await saveBlob(tarFile);


    if(status == null){
      console.error("can not read tarfile ${tarFile}")
      return;
    }
    const fbs :FileBlobInfo[] = [];
    for (const file of selectedFiles) {
      let range =  fileRanges[file];
      let hash = getHash(file);
      let extName = getExtName(file)
      let contentType = getContentTypeByExtType(extName);
      const fb = recordFileBlobInfo(hash,contentType, range,status);
      if(!fb.status.uploaded) continue;
      fbs.push(fb);
    } //end for
    if(fbs.length == 0){
      console.log('not uploaded');
      return;
    }
    if(!status.uploaded){
      return;
    }
    const tx = getAddBlobTx(status.uploadInfo.blobId,fbs);
    if(tx ){
      suiClient.signAndExecuteTransaction({
        transaction : tx,
        signer,
        options : {showEffects:true,showEvents:true},
      }).then((rsp)=>{
          if(rsp.effects ){
            if(rsp.effects.status.status ==  'failure'){
              console.log("rsp.digest",rsp.digest);
              console.log('addblob rsp error :', rsp.effects.status.error)
            } else {
              const cost = getCost(rsp.effects.gasUsed)
              console.log('add blob succ hash cost', cost, 'for file count:', fbs.length);
              if(rsp.events){
                for(let e of rsp.events){
                  console.log('event:',e.parsedJson);
                }
              }

            }
          } 
      }).catch((reason:any)=>{
        console.error('addblob catch ',reason);
      });
    }//end if

   
    //todo  uploadblob 失败，文件的tar包可能需要删除 而不是删除jpg， 下次重启需要重新upload
    //todo 记录log文件，记录打包和上传记录
    
    const unlink_callback = (path : string) =>{
      return (err:any) => {
        if (err){
          console.log('error when unlink file:',path);
        } else{
          console.log('file was deleted',path);
        }
      }
    }
    // 延迟删除 cache 目录中的文件和 upload 目录中同名的文件
    for (const file of selectedFiles) {
      const cacheFilePath = path.join(CACHE_DIR, file);
      const uploadFilePath = path.join(UPLOAD_DIR, file);
      
      unlink(cacheFilePath,unlink_callback(cacheFilePath));
      unlink(uploadFilePath,unlink_callback(uploadFilePath));
    }   

    //await fs.rmdir(CACHE_DIR);
    deleteFiles(TIME_WAIT_SECONDS_TO_DELETE);
  }
}

export default processFiles;
    
