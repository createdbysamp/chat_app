# Deployment Guide

This guide covers deploying the Chatroom Application to various hosting platforms.

## Prerequisites

1. A production backend server with WebSocket support
2. Backend URL (for REST API and WebSocket connections)
3. Account on your chosen hosting platform (Vercel or Netlify)

## Environment Variables

Before deploying, configure the following environment variables:

- `VITE_WEBSOCKET_URL`: WebSocket server URL (e.g., `wss://your-backend.com`)
- `VITE_API_URL`: Backend API URL (e.g., `https://your-backend.com`)
- `VITE_STUN_SERVER`: STUN server for WebRTC (default: `stun:stun.l.google.com:19302`)

### Local Development

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your local backend URLs

### Production

Update `.env.production` with your production backend URLs before deploying.

## Deployment Options

### Option 1: Vercel

#### Using Vercel CLI

1. Install Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   npm run deploy:vercel
   ```

#### Using Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Configure environment variables in the Vercel dashboard:
   - `VITE_WEBSOCKET_URL`
   - `VITE_API_URL`
   - `VITE_STUN_SERVER`
4. Deploy

The `vercel.json` configuration file is already set up for SPA routing.

### Option 2: Netlify

#### Using Netlify CLI

1. Install Netlify CLI:

   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:

   ```bash
   netlify login
   ```

3. Initialize site (first time only):

   ```bash
   netlify init
   ```

4. Deploy:
   ```bash
   npm run deploy:netlify
   ```

#### Using Netlify Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [netlify.com](https://netlify.com) and import your repository
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Configure environment variables in the Netlify dashboard:
   - `VITE_WEBSOCKET_URL`
   - `VITE_API_URL`
   - `VITE_STUN_SERVER`
5. Deploy

The `netlify.toml` configuration file is already set up for SPA routing.

## Build Optimization

The production build includes:

- Code splitting for React and Socket.io vendors
- Minification with esbuild
- Tree shaking for unused code
- Asset optimization

To create a production build locally:

```bash
npm run build:prod
```

To preview the production build:

```bash
npm run preview
```

## Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test authentication flow (register/login)
- [ ] Test WebSocket connection for chat
- [ ] Test WebRTC video calls
- [ ] Verify HTTPS is enabled (required for WebRTC)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Monitor error logs and performance

## Troubleshooting

### WebSocket Connection Issues

- Ensure backend URL uses `wss://` (not `ws://`) for production
- Verify CORS settings on backend allow your frontend domain
- Check that WebSocket server is running and accessible

### WebRTC Issues

- HTTPS is required for WebRTC to work in production
- Verify STUN/TURN server configuration
- Check browser console for permission errors

### Build Failures

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Verify all environment variables are set

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:

1. Connect your Git repository
2. Configure branch deployments (e.g., `main` for production)
3. Every push to the configured branch triggers a new deployment

## Custom Domain

### Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Netlify

1. Go to Site Settings → Domain Management
2. Add your custom domain
3. Configure DNS records as instructed

## Monitoring

Consider setting up:

- Error tracking (Sentry, LogRocket)
- Analytics (Google Analytics, Plausible)
- Performance monitoring (Vercel Analytics, Netlify Analytics)
