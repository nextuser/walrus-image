// server.ts
import { createServer,Server } from 'http';
import { parse } from 'url';
import next from 'next';
import { startDataCollection,initGlobalData } from '@/lib/utils/globalData';
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

initGlobalData();
startDataCollection();

const PORT = process.env.PORT || 3000;

// 初始端口号
let port = 3000;
// 最大尝试端口号
const MAX_PORT = 65535;

const startServer = () => {
    if (port > MAX_PORT) {
        console.error('已尝试所有可用端口，无法启动服务器。');
        return;
    }

    app.prepare().then(() => {
        const server: Server = createServer((req, res) => {
            const parsedUrl = parse(req.url!, true);
            handle(req, res, parsedUrl);
        });

        server.on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`端口 ${port} 已被占用，尝试使用端口 ${port + 1}...`);
                port++;
                startServer();
            } else {
                console.error('启动服务器时出现错误:', err);
            }
        });

        server.listen(port, (err?: Error) => {
            if (err) {
                console.error('启动服务器时出现错误:', err);
            } else {
                console.log(`> Ready on http://localhost:${port}`);
            }
        });
    }).catch((error) => {
        console.error('准备 Next.js 应用时出现错误:', error);
    });
};

startServer();
    