# AI Chat Frontend

React + TypeScript frontend for the AI Chat application.

## Tech Stack

- **React 19** + **TypeScript 5**
- **Vite 6** — dev server and bundler
- **React Router 7** — client-side routing
- **Axios** — HTTP client
- **STOMP.js + SockJS** — WebSocket messaging
- **CSS custom properties** — design tokens, no UI framework

## Prerequisites

- Node.js 18+
- The [AI Chat API](../ai-chat-api) running on `http://localhost:8080`

## Getting Started

```bash
npm install
npm run dev
```

The app starts on **http://localhost:5173**.

## Project Structure

```
src/
├── api/
│   └── axios.ts              # Axios instance (base URL, auth header)
├── components/
│   ├── Sidebar.tsx           # Channel list, user search, group creation
│   └── ProtectedRoute.tsx    # Redirects unauthenticated users to /login
├── context/
│   └── AuthContext.tsx       # JWT + user state, login/logout
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── ChatPage.tsx          # Main chat view
├── services/
│   ├── chatService.ts        # REST calls (channels, messages, users)
│   └── websocketService.ts   # STOMP WebSocket connection
└── types/
    └── index.ts              # Shared TypeScript interfaces
```

## Features

- **Register / Login** with JWT — token persisted in `localStorage`
- **Channel list** — only shows channels the logged-in user belongs to
- **User search** — search all users from the sidebar; clicking one opens a direct message channel (creates it if it doesn't exist yet)
- **Create group channel** — "+" button in the sidebar opens an inline form with channel name, optional description, and a member picker
- **Real-time messaging** via WebSocket (STOMP over SockJS)
- **AI responses** — messages from the AI assistant are visually distinguished

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
