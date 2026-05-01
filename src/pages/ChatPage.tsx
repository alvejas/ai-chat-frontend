import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { WebSocketService } from '../services/websocketService';
import type { Channel, Message } from '../types';
import { Sidebar } from '../components/Sidebar';

export const ChatPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const wsServiceRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    chatService.getChannels().then(setChannels);
  }, []);

  useEffect(() => {
    if (token) {
      wsServiceRef.current = new WebSocketService((msg) => {
        setMessages((prev) => [...prev, msg]);
      });
      wsServiceRef.current.connect(token);
    }
    return () => wsServiceRef.current?.disconnect();
  }, [token]);

  useEffect(() => {
    if (activeChannel) {
      chatService.getMessages(activeChannel).then(setMessages);
      wsServiceRef.current?.subscribeToChannel(activeChannel);
    }
  }, [activeChannel]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannel || !user) return;

    try {
      await chatService.sendMessage(user.username, activeChannel, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="chat-container">
      <Sidebar
        channels={channels}
        activeChannel={activeChannel}
        onChannelSelect={setActiveChannel}
      />
      <div className="chat-main">
        <header className="chat-header">
          <h2>{activeChannel ? `# ${activeChannel}` : 'Select a channel'}</h2>
          <button onClick={logout}>Logout</button>
        </header>
        <div className="message-list">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.isAiResponse ? 'ai' : ''}`}>
              <span className="sender">{msg.senderName}</span>
              <p className="content">{msg.content}</p>
              <span className="time">{new Date(msg.createdAt).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" disabled={!activeChannel}>Send</button>
        </form>
      </div>
    </div>
  );
};
