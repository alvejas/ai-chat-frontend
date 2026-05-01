import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import type { Message as StompMessage } from '@stomp/stompjs';
import type { Message } from '../types';

export class WebSocketService {
  private onMessageReceived: (message: Message) => void;
  private client: Client | null = null;
  private pendingChannel: string | null = null;

  constructor(onMessageReceived: (message: Message) => void) {
    this.onMessageReceived = onMessageReceived;
  }

  connect(token: string) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        if (this.pendingChannel) {
          this.doSubscribe(this.pendingChannel);
          this.pendingChannel = null;
        }
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      },
    });

    this.client.activate();
  }

  subscribeToChannel(channelName: string) {
    if (!this.client || !this.client.connected) {
      this.pendingChannel = channelName;
      return;
    }
    this.doSubscribe(channelName);
  }

  private doSubscribe(channelName: string) {
    this.client!.subscribe(`/topic/channel/${channelName}`, (message: StompMessage) => {
      this.onMessageReceived(JSON.parse(message.body) as Message);
    });
  }

  disconnect() {
    this.client?.deactivate();
  }
}
