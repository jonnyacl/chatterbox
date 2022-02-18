import express from 'express';
import * as http from 'http';
import { config } from './config';
import { chatter } from './chatter';
/**
 * Start the express server.
 */
export const startServer = async (): Promise<http.Server> => {
  const app = express();
  const port = config.port;

  const chatterServer = chatter();

  // app.use(cors());
  // app.use(express.urlencoded({ extended: true }));
  // app.use(express.json());
  // app.use(router());

  // app.get('/ping', (req, res) => res.send('pong'));
  // app.use((err, req, res, next) => {
  //   if (err) {
  //     console.error('err', err);
  //     if (err.name === 'UnauthorizedError') {
  //       res.status(401).send('Invalid token');
  //     } else {
  //       console.error(err);
  //       res.status(500).send({ error: err.message });
  //     }
  //   }
  // });

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
