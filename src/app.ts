import express from 'express';
import * as http from 'http';
import { config } from './config';
import { chatter } from './chatter';
import cors from 'cors';
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

  const server = app.listen(port, () =>
    console.log(`Server is listening on ${port}`)
  );
  server.on('upgrade', (request, socket, head) => {
    chatterServer.handleUpgrade(request, socket, head, (websocket) => {
      chatterServer.emit('connection', websocket, request);
    });
  });

  return server;
};
