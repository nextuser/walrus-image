import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 假设图片存储在 public/images 目录下
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

export async function GET(request: NextRequest, 
    { params }: { params: Promise<{ filepath: string }> }
) {
    const { filepath } = await params;
    if (!filepath) {
        return NextResponse.json({ message: 'Missing filepath' }, { status: 400 });
    }

    const fullFilePath = path.join(IMAGES_DIR, filepath);

    try {
        // 检查文件是否存在
        await fs.access(fullFilePath);

        // 读取文件内容
        const fileContent = await fs.readFile(fullFilePath);

        // 根据文件扩展名设置 Content-Type
        const ext = path.extname(fullFilePath).toLowerCase();
        let contentType = 'application/octet-stream';
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            // 可以根据需要添加更多文件类型
        }

        return new NextResponse(fileContent, {
            headers: {
                'Content-Type': contentType,
            },
        });
    } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }
}