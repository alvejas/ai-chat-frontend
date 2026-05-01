import React from 'react';
import type { Channel } from '../types';

interface SidebarProps {
  channels: Channel[];
  activeChannel: string | null;
  onChannelSelect: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ channels, activeChannel, onChannelSelect }) => {
  return (
    <div className="sidebar">
      <h3>Channels</h3>
      <ul>
        {channels.map((channel) => (
          <li
            key={channel.name}
            className={activeChannel === channel.name ? 'active' : ''}
            onClick={() => onChannelSelect(channel.name)}
          >
            # {channel.name}
          </li>
        ))}
      </ul>
    </div>
  );
};
