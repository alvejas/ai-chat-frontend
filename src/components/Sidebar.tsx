import React, { useState } from 'react';
import type { Channel, UserSummary, User } from '../types';

interface SidebarProps {
  channels: Channel[];
  allUsers: UserSummary[];
  activeChannel: string | null;
  onChannelSelect: (name: string) => void;
  onUserSelect: (username: string) => void;
  onCreateGroup: (name: string, receiverUsername: string, description?: string) => void;
  user: User | null;
  onLogout: () => void;
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

export const Sidebar: React.FC<SidebarProps> = ({
  channels, allUsers, activeChannel,
  onChannelSelect, onUserSelect, onCreateGroup,
  user, onLogout,
}) => {
  const [search, setSearch] = useState('');
  const [showGroup, setShowGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const userResults = search.trim()
    ? allUsers.filter(
        (u) =>
          u.username !== user?.username &&
          u.username.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const memberResults =
    memberSearch.trim() && !selectedMember
      ? allUsers.filter(
          (u) =>
            u.username !== user?.username &&
            u.username.toLowerCase().includes(memberSearch.toLowerCase())
        )
      : [];

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !selectedMember) return;
    onCreateGroup(groupName.trim(), selectedMember, groupDesc.trim() || undefined);
    setGroupName('');
    setGroupDesc('');
    setMemberSearch('');
    setSelectedMember(null);
    setShowGroup(false);
  };

  const cancelGroup = () => {
    setShowGroup(false);
    setGroupName('');
    setGroupDesc('');
    setMemberSearch('');
    setSelectedMember(null);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-workspace">
          <span className="sidebar-workspace-name">AI Chat</span>
          <svg
            className="sidebar-workspace-chevron"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="sidebar-search">
          <svg
            className="sidebar-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => setTimeout(() => setSearch(''), 150)}
          />
          {userResults.length > 0 && (
            <div className="user-search-dropdown">
              {userResults.map((u) => (
                <div
                  key={u.username}
                  className="user-search-item"
                  onMouseDown={() => { onUserSelect(u.username); setSearch(''); }}
                >
                  <div
                    className="user-search-avatar"
                    style={{ background: getAvatarColor(u.username) }}
                  >
                    {getInitials(u.username)}
                  </div>
                  <span>{u.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-channels">
        <div className="sidebar-section-label">
          <span>Channels</span>
          <button
            className="sidebar-add-btn"
            onClick={() => setShowGroup((v) => !v)}
            title="Create channel"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {showGroup && (
          <form className="sidebar-create-group" onSubmit={handleGroupSubmit}>
            <input
              placeholder="Channel name *"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
            />
            <input
              placeholder="Description (optional)"
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
            />
            <div className="sidebar-member-picker">
              {selectedMember ? (
                <div className="member-chip">
                  <div
                    className="member-chip-avatar"
                    style={{ background: getAvatarColor(selectedMember) }}
                  >
                    {getInitials(selectedMember)}
                  </div>
                  <span>{selectedMember}</span>
                  <button
                    type="button"
                    className="member-chip-remove"
                    onClick={() => setSelectedMember(null)}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    placeholder="Add member *"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                  {memberResults.length > 0 && (
                    <div className="user-search-dropdown">
                      {memberResults.map((u) => (
                        <div
                          key={u.username}
                          className="user-search-item"
                          onMouseDown={() => {
                            setSelectedMember(u.username);
                            setMemberSearch('');
                          }}
                        >
                          <div
                            className="user-search-avatar"
                            style={{ background: getAvatarColor(u.username) }}
                          >
                            {getInitials(u.username)}
                          </div>
                          <span>{u.username}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="sidebar-create-group-actions">
              <button type="button" className="btn-cancel" onClick={cancelGroup}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-create"
                disabled={!groupName.trim() || !selectedMember}
              >
                Create
              </button>
            </div>
          </form>
        )}

        {channels.map((channel) => (
          <div
            key={channel.name}
            className={`channel-item ${activeChannel === channel.name ? 'active' : ''}`}
            onClick={() => onChannelSelect(channel.name)}
          >
            <span className="channel-hash">#</span>
            <span className="channel-name">{channel.name}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        {user && (
          <>
            <div
              className="sidebar-user-avatar"
              style={{ background: getAvatarColor(user.username) }}
            >
              {getInitials(user.username)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-username">{user.username}</div>
              <div className="sidebar-status">Online</div>
            </div>
          </>
        )}
        <button className="sidebar-logout-btn" onClick={onLogout} title="Log out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
