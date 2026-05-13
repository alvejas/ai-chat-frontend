import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { WebSocketService } from '../services/websocketService';
import type { Channel, Message, UserSummary } from '../types';
import { Sidebar } from '../components/Sidebar';

interface MessageGroup {
  senderName: string;
  isAiResponse: boolean;
  isOwn: boolean;
  messages: Message[];
}

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f59e0b', '#ef4444', '#22c55e', '#3b82f6',
  '#f97316', '#06b6d4',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function groupMessages(messages: Message[], currentUsername: string | undefined): MessageGroup[] {
  return messages.reduce<MessageGroup[]>((groups, msg) => {
    const last = groups[groups.length - 1];
    const isOwn = msg.senderName === currentUsername && !msg.isAiResponse;
    if (last && last.senderName === msg.senderName && last.isAiResponse === msg.isAiResponse) {
      last.messages.push(msg);
    } else {
      groups.push({ senderName: msg.senderName, isAiResponse: msg.isAiResponse, isOwn, messages: [msg] });
    }
    return groups;
  }, []);
}

export const ChatPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatService.getChannels().then(setChannels);
    chatService.getUsers().then(setAllUsers);
  }, []);

  const handleUserSelect = async (receiverUsername: string) => {
    if (!user) return;
    const dmName = [user.username, receiverUsername].sort().join('-');
    const existing = channels.find((c) => c.name === dmName);
    if (existing) {
      setActiveChannel(dmName);
      return;
    }
    try {
      const channel = await chatService.createChannel({
        name: dmName,
        creatorUsername: user.username,
        receiverUsername,
      });
      setChannels((prev) => [...prev, channel]);
      setActiveChannel(channel.name);
    } catch (err) {
      console.error('Failed to create DM channel', err);
    }
  };

  const handleCreateGroup = async (name: string, receiverUsername: string, description?: string) => {
    if (!user) return;
    try {
      const channel = await chatService.createChannel({
        name,
        creatorUsername: user.username,
        receiverUsername,
        description,
      });
      setChannels((prev) => [...prev, channel]);
      setActiveChannel(channel.name);
    } catch (err) {
      console.error('Failed to create group channel', err);
    }
  };

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeChannel || !user) return;
    chatService
      .sendMessage(user.username, activeChannel, newMessage)
      .then(() => {
        setNewMessage('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      })
      .catch((err: unknown) => console.error('Failed to send message', err));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const messageGroups = useMemo(
    () => groupMessages(messages, user?.username),
    [messages, user?.username]
  );

  return (
    <div className="chat-app">
      {/* Nav Rail */}
      <nav className="nav-rail">
        <div className="nav-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <button className="nav-btn active" title="Chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="nav-spacer" />

        <button className="nav-btn" title="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </nav>

      <Sidebar
        channels={channels}
        allUsers={allUsers}
        activeChannel={activeChannel}
        onChannelSelect={setActiveChannel}
        onUserSelect={handleUserSelect}
        onCreateGroup={handleCreateGroup}
        user={user}
        onLogout={logout}
      />

      <div className="chat-main">
        {activeChannel ? (
          <>
            <header className="chat-header">
              <span className="chat-header-hash">#</span>
              <span className="chat-header-name">{activeChannel}</span>
              <div className="chat-header-spacer" />
              <div className="chat-header-actions">
                <button className="header-action-btn" title="Search in channel">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button className="header-action-btn" title="Members">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </header>

            <div className="message-list">
              {messageGroups.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3>No messages yet</h3>
                  <p>Be the first to say something in #{activeChannel}</p>
                </div>
              ) : (
                messageGroups.map((group, gi) => (
                  <div
                    key={gi}
                    className={[
                      'message-group',
                      group.isOwn ? 'own' : '',
                      group.isAiResponse ? 'ai' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className="message-group-header">
                      {!group.isOwn && (
                        <div
                          className={`msg-avatar${group.isAiResponse ? ' ai-avatar' : ''}`}
                          style={
                            !group.isAiResponse
                              ? { background: getAvatarColor(group.senderName) }
                              : undefined
                          }
                        >
                          {group.isAiResponse ? '✦' : getInitials(group.senderName)}
                        </div>
                      )}
                      <div className="msg-sender-info">
                        <span className="msg-sender-name">
                          {group.isOwn ? 'You' : group.isAiResponse ? 'AI Assistant' : group.senderName}
                        </span>
                        {group.isAiResponse && <span className="ai-label">AI</span>}
                      </div>
                      <span className="msg-timestamp">
                        {new Date(group.messages[0].createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="msg-bubble-stack">
                      {group.messages.map((msg, mi) => (
                        <div key={mi} className="msg-bubble">
                          {msg.content}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-composer">
              <div className="composer-box">
                <textarea
                  ref={textareaRef}
                  className="composer-textarea"
                  placeholder={`Message #${activeChannel}`}
                  value={newMessage}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <div className="composer-actions">
                  <button className="composer-action-btn" type="button" title="Add emoji">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="composer-action-btn" type="button" title="Attach file">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="composer-send-btn"
                    type="button"
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    title="Send message"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="composer-hint">Enter to send · Shift+Enter for new line</div>
            </div>
          </>
        ) : (
          <div className="no-channel-state">
            <div className="no-channel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p>Select a channel to start chatting</p>
            <span>Choose a channel from the sidebar</span>
          </div>
        )}
      </div>
    </div>
  );
};
