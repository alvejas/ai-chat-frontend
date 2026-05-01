export interface User {
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
}

export interface Channel {
  name: string;
  description?: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface Message {
  content: string;
  senderName: string;
  channelName: string;
  isAiResponse: boolean;
  createdAt: string;
}
