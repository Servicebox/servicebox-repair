///public/src/server.js
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import mongoose from 'mongoose';
import { initSocket } from './lib/socket.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: '.' });
const handle = app.getRequestHandler();

const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/serviceboxdb';

app.prepare().then(() => {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Соединение с базой данных установлено'))
    .catch((error) => console.error('Ошибка подключения к базе данных:', error));

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  initSocket(server);

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});