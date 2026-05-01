import api from '../api/axios';
import type { Channel, Message } from '../types';

export const chatService = {
  getChannels: async (): Promise<Channel[]> => {
    const response = await api.get('/channels');
    return response.data;
  },

  getMessages: async (channelName: string): Promise<Message[]> => {
    const response = await api.get(`/messages/channel/${channelName}`);
    return response.data;
  },

  sendMessage: async (username: string, channelName: string, content: string): Promise<Message> => {
    const response = await api.post('/messages', { username, channelName, content });
    return response.data;
  },

  createChannel: async (name: string, description: string, isPrivate: boolean): Promise<Channel> => {
    const response = await api.post('/channels', { name, description, isPrivate });
    return response.data;
  }
};
