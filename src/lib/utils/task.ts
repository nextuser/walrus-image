import { promises as fs } from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { execSync } from 'child_process';
import { uploadTarToWalrus, saveBlobInfoToDB, getBlobUrl } from './db'; // 假设存在上传和保存信息的函数
import tar from 'tar-stream';
import { FileBlobInfo, FileRange } from './types';
import { UPLOAD_DIR,CACHE_DIR,TAR_DIR } from './dirs';
import { start } from 'repl';
import { getBlobMap } from './globalData';
const SIZE_TOO_LARGE = 60 * 1024 * 1024;
const SIZE_TO_TAR = 100  * 1024;

function log(...args :any[] ){
  console.log(args);
}
async function processFiles() {
  const blobMap = getBlobMap();
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
      log(`fileRanges[file]`);
      ///currentOffset += stats.size + 512; // 加上文件头大小
    }

    pack.finalize();
    pack.pipe(tarStream);

    await new Promise((resolve, reject) => {
      tarStream.on('finish', ()=>resolve(null));
      tarStream.on('error', reject);
    });

    const blobId = await uploadTarToWalrus(tarPath);
    
    for (const file of selectedFiles) {
      let range =  fileRanges[file];
      let blobInfo = saveBlobInfoToDB(blobMap,file, blobId,range);
      log('filename:',file);
      log(getBlobUrl("http","localhost:8080",blobInfo));
    }

    // 删除 cache 目录中的文件和 upload 目录中同名的文件
    for (const file of selectedFiles) {
      const cacheFilePath = path.join(CACHE_DIR, file);
      const uploadFilePath = path.join(UPLOAD_DIR, file);
      await fs.unlink(cacheFilePath);
      await fs.unlink(uploadFilePath);
    }
    await fs.rmdir(CACHE_DIR);
  }
}

export default processFiles;
    
