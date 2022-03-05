import express from 'express';
import * as http from 'http';
import { config } from './config';
import { chatter } from './chatter';
import cors from 'cors';
import { auth, useAuth } from './auth';

/**
 * Start the express server.
 */
export const startServer = async (): Promise<http.Server> => {
  const app = express();
  const port = config.port;

  const chatterServer = chatter();

  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.get('/ping', (req, res) => res.send('pong'));
  app.use(useAuth);
  const server = app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
  });
  server.on('upgrade', async (request: http.IncomingMessage, socket, head) => {
    try {
      const token = request.url.split('?access_token=')[1];
      const isAuth = await auth(token);
      if (!isAuth) {
        socket.write(
          'HTTP/1.1 401 Web Socket Protocol Handshake\r\n' +
            'Upgrade: WebSocket\r\n' +
            'Connection: Upgrade\r\n' +
            '\r\n'
        );
        socket.destroy();
        return;
      }
      chatterServer.handleUpgrade(request, socket, head, (websocket) => {
        chatterServer.emit('connection', websocket, request);
      });
    } catch (e) {
      console.error('Failed to establish websocket connection');
    }
  });

  return server;
};
