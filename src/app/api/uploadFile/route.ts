import axios from 'axios';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '@/lib/utils/dirs';
import {ContentType, getContentTypeByExtType,getContentTypeByMimetype,getExtTypeByContentType} from '@/lib/utils/content'
import {getImageUrl,generateHash} from '@/lib/utils'
import { addFile ,hasFile} from '@/lib/utils/globalData';
async function downloadImage(imageUrl: string): Promise<Buffer> {
  console.log("downloadImage:",imageUrl);
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}


export async function POST(request: Request) {
    console.log("upload/route.ts :post");
    try {
      
      const formData = await request.formData();
      const fileOrUrl : File|string|null = formData.get('file') ;

      if (!fileOrUrl) {
        return NextResponse.json({ message: 'Invalid arg of file' }, { status: 400 });
      }
      let contentType : ContentType;
      let buffer : Buffer;
      let suffix : string ;
      if (typeof fileOrUrl === 'string') {
        // console.log("download url:",fileOrUrl);
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
        suffix = getExtTypeByContentType(contentType);
         // suffix = detectImageExtension(buffer);
      } else {
          buffer = Buffer.from(await fileOrUrl.arrayBuffer());
          suffix = fileOrUrl.name.split('.').pop() || "bin";
          contentType = getContentTypeByExtType(suffix);
      }
  
      if (!buffer) {
        return NextResponse.json({ message: '未找到文件' }, { status: 400 });
      }

      // 保存文件到本地（示例路径：public/uploads）

      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
        
      const hash = generateHash(buffer);
      const fileName = `${hash}.${suffix}`; // 生成唯一文件名


      if(!hasFile(hash)){
        const filePath = path.join(UPLOAD_DIR, fileName);
        fs.writeFileSync(filePath, buffer);
        let fileInfo =  {
          hash : hash,
          content_type : contentType,
          size : buffer.length
        };
        console.log("upload image file:", filePath);
        console.log("add file hash , contentype, filename", hash,contentType,fileName);
        addFile(fileInfo);
      } else{
        console.log("file uploaded,reuse it", fileName);
      }
       
      // 返回文件 URL
      const fileUrl = getImageUrl(request,`${fileName}`);
     
      return NextResponse.json({ url: fileUrl }, { status: 200 });
    } catch (error) {
      console.error('上传失败:', error);
      return NextResponse.json({ message: '上传失败' }, { status: 500 });
    }
  }