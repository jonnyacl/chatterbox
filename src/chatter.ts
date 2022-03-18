import WebSocket from 'ws';

export interface IMessage {
  senderId: string;
  message: string;
  timestamp: Date;
  name: string;
}

export interface ConnectionRecord {
  connection: WebSocket;
  userName: string;
}
export const clients: Set<WebSocket> = new Set<WebSocket>();
export const clientIDs: Record<string, ConnectionRecord> = {};
export let messages: IMessage[] = [];
const MAX_MESSAGES_LENGTH = 1000;

export interface IChatterEvent {
  event: 'INITIAL_CONNECTION' | 'CHAT' | 'USER_JOIN';
  senderId?: string;
  clientId: string;
  data?: unknown;
  timestamp: Date;
  name: string;
}

const closeConnection = (connection: WebSocket, clientId: string): void => {
  console.log('Closing connection...', clientId);
  connection.close();
  clients.delete(connection);
  clientIDs[clientId].connection.close();
  clientIDs[clientId] = null;
};

export const chatter = (): WebSocket.Server => {
  const wsServer = new WebSocket.Server({
    noServer: true,
    path: '/chat',
  });
  wsServer.on('connection', (websocketConnection: WebSocket) => {
    websocketConnection.on('message', (message: WebSocket.RawData) => {
      const messageStr = message.toString();
      try {
        const messageData = JSON.parse(messageStr);
        if (messageData.event === 'USER_JOIN') {
          const clientId = messageData.userId;
          console.log('NEW USER JOINED', clientId);
          const joinEvent: IChatterEvent = {
            event: 'USER_JOIN',
            clientId,
            data: { message: `${messageData.name} has joined the chat` },
            timestamp: new Date(),
            name: messageData.name,
          };
          clientIDs[clientId] = {
            connection: websocketConnection,
            userName: messageData.name,
          };
          console.log(clientIDs);
          // tell other clients this one has joined
          clients.forEach((c) => {
            c.send(JSON.stringify(joinEvent));
          });
          clients.add(websocketConnection);
          websocketConnection.on('close', () =>
            closeConnection(websocketConnection, clientId)
          );
          const initialConnectionEvent: IChatterEvent = {
            event: 'INITIAL_CONNECTION',
            clientId,
            data: {
              messages,
            },
            timestamp: new Date(),
            name: messageData.name,
          };
          websocketConnection.send(JSON.stringify(initialConnectionEvent));
        }
        if (messageData.event === 'CHAT') {
          if (clientIDs[messageData.userId]) {
            const user = clientIDs[messageData.userId];
            const newMessage: IMessage = {
              senderId: messageData.userId,
              message: messageData.message,
              name: user.userName,
              timestamp: new Date(),
            };
            if (messages.length > MAX_MESSAGES_LENGTH) {
              messages = messages.slice(MAX_MESSAGES_LENGTH * -1);
            }
            messages.push(newMessage);
            const chatEvent: IChatterEvent = {
              event: 'CHAT',
              senderId: messageData.userId,
              clientId: messageData.userId,
              data: { message: newMessage },
              timestamp: new Date(),
              name: user.userName,
            };
            wsServer.clients.forEach((client: WebSocket) => {
              client.send(JSON.stringify(chatEvent));
            });
          }
        }
      } catch (e) {
        console.log('Invalid chat message', messageStr, e);
      }
    });
  });
  return wsServer;
};
