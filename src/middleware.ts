// middleware.ts
// 显式指定 Node.js 运行时

import { NextRequest, NextResponse } from 'next/server';
import { initAll } from '@/lib/utils/globalData';
// 模拟初始化数据

// 在模块加载时初始化数据
initAll();

export function middleware(request: NextRequest) {
    // 可以在中间件中使用初始化的数据
    return NextResponse.next();
}

// 可以选择配置中间件的匹配路径
export const config = {
    matcher: [
        /*
         * 匹配所有路径，也可以指定特定路径，例如：
         * '/api/:path*' 匹配所有 /api 开头的路径
         */
        '/((?!_next/static|_next/image|favicon.ico).*)'
    ],
    runtime: 'nodejs',
};
