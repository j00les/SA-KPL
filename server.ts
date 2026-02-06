import { createServer } from 'http';
import next from 'next';
import { Server as SocketServer } from 'socket.io';
import { initSocketServer } from './src/lib/socket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  initSocketServer(io);

  httpServer.listen(port, () => {
    console.log(`> KPL Round 2 ready on http://${hostname}:${port}`);
  });
});
