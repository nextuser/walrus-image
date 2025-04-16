import axios from 'axios';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '@/lib/utils/dirs';

async function downloadImage(imageUrl: string): Promise<Buffer> {
  console.log("downloadImage:",imageUrl);
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}
export async function POST(request: Request) {
    console.log("upload/route.ts :post");
    
    try {
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || '';
      const site_url = `${protocol}://${host}`;
      const formData = await request.formData();
      const fileOrUrl : File|string|null = formData.get('file') ;

      if (!fileOrUrl) {
        return NextResponse.json({ message: 'Invalid arg of file' }, { status: 400 });
      }
      let suffix :string|undefined;
      let buffer : Buffer;
      if (typeof fileOrUrl === 'string') {
          // const response = await fetch(finalConfig.proxyUrl, {
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json' },
          //     body: JSON.stringify({ url: fileOrUrl }),
          // });
          // if (!response.ok) {
          //     throw new Error(`HTTP error! status: ${response.status}`);
          // }
          // body = await response.blob();
          console.log("download url:",fileOrUrl);
          buffer = (await downloadImage(fileOrUrl));
          suffix = fileOrUrl.split('.').pop();
      } else {
          buffer = Buffer.from(await fileOrUrl.arrayBuffer());
          suffix = fileOrUrl.name.split('.').pop();
      }
  
      if (!buffer) {
        return NextResponse.json({ message: '未找到文件' }, { status: 400 });
      }
  
      if(!suffix){
        suffix = "png";
      }

      // 保存文件到本地（示例路径：public/uploads）

      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
  
      console.log("uploadDir:", UPLOAD_DIR);
  
      const fileName = `image-${Date.now()}.${suffix}`; // 生成唯一文件名
      const filePath = path.join(UPLOAD_DIR, fileName);
      fs.writeFileSync(filePath, buffer);

       
      // 返回文件 URL
      const fileUrl = `${site_url}/images/${fileName}`;
     
      return NextResponse.json({ url: fileUrl }, { status: 200 });
    } catch (error) {
      console.error('上传失败:', error);
      return NextResponse.json({ message: '上传失败' }, { status: 500 });
    }
  }