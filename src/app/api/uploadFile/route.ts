import axios from 'axios';
import { NextResponse } from 'next/server';
import {getFs} from '@/lib/utils/globalData';
import path from 'path';
import { UPLOAD_DIR } from '@/lib/utils/dirs';
import {ContentType, getContentTypeByExtType,getContentTypeByMimetype,getExtTypeByContentType} from '@/lib/utils/content'
import {getImageUrl,generateHash} from '@/lib/utils'
import { addFileInfo ,addFileId,getFileInfo,hasFile} from '@/lib/utils/globalData';
import { getServerSideSuiClient } from '@/lib/utils/tests/suiClient';
import { FileInfo } from '@/lib/utils/types';
import * as su from '@/lib/utils/suiUtil'
import { getSigner } from '@/lib/utils/tests/local_key';
import { logger } from '@/lib/utils/logger';
async function downloadImage(imageUrl: string): Promise<Buffer> {
  console.log("downloadImage:",imageUrl);
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

const suiClient = getServerSideSuiClient();
export async function POST(request: Request) {
    //c();  global init will startDataCollection
    console.log("upload/route.ts :post");
    try {
      
      const formData = await request.formData();
      const fileOrUrl : File|string|null = formData.get('file') ;
      const owner : File|string |null = formData.get('owner');

      if (!fileOrUrl || typeof(owner) != 'string') {
        return NextResponse.json({ message: 'Invalid arg : owner or file invalid' }, { status: 400 });
      }
      let contentType : ContentType;
      let buffer : Buffer;
      if (typeof fileOrUrl === 'string') {
        ////console.log("download url:",fileOrUrl);
        // buffer = (await downloadImage(fileOrUrl));
        console.log("filedata prefix ",  fileOrUrl.substring(0,10));
        const basePrefix = "base64,"; 
        const baseStart = fileOrUrl.indexOf(basePrefix);
        const base64Data = fileOrUrl.substring(baseStart + basePrefix.length);
        const prefix = 'data:';
        let mimeStart = fileOrUrl.indexOf(prefix) + prefix.length;
        let mimeEnd = fileOrUrl.indexOf(';',mimeStart);
         //data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ
        let mimeType = fileOrUrl.substring(mimeStart,mimeEnd);

        console.log(`mimeType:|${mimeType}|`,"basedata:",base64Data.substring(0,8));
       
        // 将 base64 编码转换为二进制数据
        buffer = Buffer.from(base64Data, 'base64');
        contentType = getContentTypeByMimetype(mimeType);
         // suffix = detectImageExtension(buffer);
      } else {
          buffer = Buffer.from(await fileOrUrl.arrayBuffer());
          let ext  = fileOrUrl.name.split('.').pop() || "bin";
          contentType = getContentTypeByExtType(ext);
      }
  
      if (!buffer) {
        return NextResponse.json({ message: '未找到文件' }, { status: 400 });
      }
      const fs = getFs()
      // 保存文件到本地（示例路径：public/uploads）
      console.info("check dir",UPLOAD_DIR)
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      } 
       //从文件可能多个 对应到一个content,  一个content只会对应到一个ext,方便后面根据存储的contenttype来推断 ext
      let ext = getExtTypeByContentType(contentType);
      const hash = generateHash(buffer);
      const fileName = `${hash}.${ext}`; // 生成唯一文件名
      if(!hasFile(hash)){
        const filePath = path.join(UPLOAD_DIR, fileName);
        console.info("writeFileSync",filePath)
        fs.writeFileSync(filePath, buffer);
        let fileInfo : FileInfo =  {
          hash : hash,
          content_type : contentType,
          size : buffer.length
        };
        console.log("upload image file:", filePath);
        console.log("add file hash , contentype, filename", hash,contentType,fileName);
        addFileInfo(fileInfo);
        const signer = getSigner();
        su.addFile(suiClient,signer,owner,fileInfo.hash,fileInfo.size);
        addFileId(owner,hash);        

      } else{
        addFileId(owner,hash);
        console.log("file on walrus,reuse it", fileName);
      }
      const fileUrl = getImageUrl(request,hash,ext);
      const fileInfo = getFileInfo(hash);
      return NextResponse.json({ url: fileUrl,fileInfo : fileInfo }, { status: 200 });
       
      // 返回文件 URL

    } catch (error) {
      console.error('上传失败:', error);
      return NextResponse.json({ message: '上传失败' }, { status: 500 });
    }
  }