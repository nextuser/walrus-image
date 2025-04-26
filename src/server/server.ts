// server.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { startDataCollection } from '@/lib/utils/globalData';
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

//initGlobalData();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    }).listen(PORT, (err?: any) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});