import api from '../api/axios';
import type { Channel, Message, UserSummary } from '../types';

export const chatService = {
  getChannels: async (): Promise<Channel[]> => {
    const response = await api.get('/channels');
    return response.data;
  },

  getUsers: async (): Promise<UserSummary[]> => {
    const response = await api.get('/users');
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

  createChannel: async (params: {
    name: string;
    creatorUsername: string;
    receiverUsernames: string[];
    description?: string;
  }): Promise<Channel> => {
    const response = await api.post('/channels', params);
    return response.data;
  },
};
