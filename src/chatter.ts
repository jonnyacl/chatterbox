import { IncomingMessage } from 'http';
import WebSocket from 'ws';

export interface IMessage {
  senderId: string;
  message: string;
  timestamp: Date;
}
export const clients: Set<WebSocket> = new Set<WebSocket>();
export const clientIDs: Record<string, WebSocket> = {};
export const messages: IMessage[] = [];

export interface IClientEvent {
  event: 'INITIAL_CONNECTION' | 'CHAT' | 'CLIENT_JOIN' | 'SET_ID';
  senderId?: string;
  clientId: string;
  data?: unknown;
  timestamp: Date;
}

export const chatter = (): WebSocket.Server => {
  const wsServer = new WebSocket.Server({
    noServer: true,
    path: '/chat',
  });
  wsServer.on(
    'connection',
    (websocketConnection: WebSocket, connectionRequest: IncomingMessage) => {
      const clientId =
        (connectionRequest.headers.user as string) ||
        connectionRequest.headers['sec-websocket-key'];
      const joinEvent: IClientEvent = {
        event: 'CLIENT_JOIN',
        clientId,
        data: { message: `${clientId} has joined the chat` },
        timestamp: new Date(),
      };
      // tell other clients this one has joined
      clients.forEach((c) => {
        c.send(JSON.stringify(joinEvent));
      });
      clients.add(websocketConnection);
      websocketConnection.on('close', () => {
        clients.delete(websocketConnection);
      });
      const initialConnectionEvent: IClientEvent = {
        event: 'INITIAL_CONNECTION',
        clientId,
        data: {
          messages,
        },
        timestamp: new Date(),
      };
      websocketConnection.send(JSON.stringify(initialConnectionEvent));

      websocketConnection.on('message', (message: WebSocket.RawData) => {
        const messageStr = message.toString();
        try {
          const messageData = JSON.parse(messageStr);
          if (messageData.event === 'CHAT') {
            if (clientIDs[messageData.userId]) {
              const newMessage: IMessage = {
                senderId: messageData.userId,
                message: messageData.message,
                timestamp: new Date(),
              };
              messages.push(newMessage);
              const chatEvent: IClientEvent = {
                event: 'CHAT',
                senderId: messageData.userId,
                clientId,
                data: { message: newMessage },
                timestamp: new Date(),
              };
              wsServer.clients.forEach((client: WebSocket) => {
                client.send(JSON.stringify(chatEvent));
              });
            }
          } else if (messageData.event === 'SET_ID') {
            if (!clientIDs[messageData.userId]) {
              clientIDs[messageData.userId] = websocketConnection;
            } else {
              console.error(
                'duplicate user, terminating connections',
                messageData.userId
              );
              websocketConnection.close();
              clientIDs[messageData.userId].close();
            }
          }
        } catch (e) {
          console.log('Invalid chat message', messageStr, e);
        }
      });
    }
  );
  return wsServer;
};
