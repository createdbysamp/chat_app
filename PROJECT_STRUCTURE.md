# Chatroom Application - Project Structure

## Overview

This is a React + TypeScript application built with Vite for a real-time chatroom with video calling capabilities.

## Technology Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router DOM** for routing
- **Socket.IO Client** for real-time messaging
- **Tailwind CSS** for styling

## Directory Structure

```
chatroom-app/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page-level components
│   ├── contexts/       # React context providers
│   ├── services/       # External service integrations (WebSocket, WebRTC)
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   ├── assets/         # Static assets
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles with Tailwind directives
├── public/             # Public static files
├── dist/               # Production build output
└── package.json        # Project dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Next Steps

Follow the implementation plan in `.kiro/specs/chatroom-site/tasks.md` to build out the application features.
