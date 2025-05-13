// // server.ts
// import { createServer,Server } from 'http';
// import { parse } from 'url';
// import next from 'next';
// import dotenv from 'dotenv';
// import { initGlobalDataOnce} from '@/lib/utils/globalData';
// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();

// dotenv.config();

// initGlobalDataOnce();

// const PORT = process.env.PORT || 3000;

// // 初始端口号
// let port = Number(PORT);
// // 最大尝试端口号
// const MAX_PORT = 65535;

// const startServer = () => {
//     console.log('---startServer port:',port);
//     if (port > MAX_PORT) {
//         console.error('已尝试所有可用端口，无法启动服务器。');
//         return;
//     }

//     app.prepare().then(() => {
//         const server: Server = createServer((req, res) => {
//             const parsedUrl = parse(req.url!, true);
//             handle(req, res, parsedUrl);
//         });

//         server.on('error', (err: NodeJS.ErrnoException) => {
//             if (err.code === 'EADDRINUSE' ) {
//                 console.log(`---server.on error EADDRINUSE 端口 ${port} 已被占用，尝试使用端口 ${port + 1}...`);
//                 port++;
//                 startServer();
//             } else {
//                 console.error('---server.on error 启动服务器时出现错误:code=',err.code, err);
//             }
//         });
        
//         server.listen(port, (err?: Error) => {
//             if (err) {
//                 console.error('---server.listen error 启动服务器时出现错误:', err);
//             } else {
//                 console.log(`---server Ready on http://localhost:${port}`);
//             }
//         });
//     }).catch((error) => {
//         console.error('app.prepare catch 准备 Next.js 应用时出现错误:', error);

//     });
// };

// startServer();
    