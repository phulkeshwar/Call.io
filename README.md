# Call.io

Call.io is a full-stack MERN real-time communication app for one-to-one chat,
audio calls, and video calls. It uses React and Vite on the frontend, Express
and MongoDB on the backend, Socket.IO for realtime signaling and chat, and
WebRTC for peer-to-peer media streams.

## Features

- Account registration and login with JWT authentication
- Country-aware user profiles with generated 6-digit public user IDs
- Shareable `/chat/:userId` links for starting conversations from a public ID
- Online, offline, and busy presence updates over Socket.IO
- One-to-one realtime chat with message history
- Typing indicators, unread counts, delivered receipts, and read receipts
- One-to-one audio and video calls using WebRTC
- Incoming call modal with accept and reject flows
- Call controls for mute, camera toggle, timer, and hang up
- Optional Redis-backed realtime state for multi-instance deployments
- In-memory realtime state fallback for local development or single-instance use

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- Socket.IO
- WebRTC signaling
- JWT authentication
- Redis and `@socket.io/redis-adapter` for optional horizontal scaling

## Project Structure

```text
call.io/
  backend/              Express API, MongoDB models, Socket.IO signaling
  frontend/             React/Vite client
  docs/                 Setup and deployment notes
  learning-hub/         Learning modules and demos for the app concepts
  DEPLOYMENT_GUIDE.md   Additional deployment notes
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB running locally or a MongoDB Atlas connection string
- Redis is optional. Without `REDIS_URL`, the backend uses in-memory realtime
  state, which is fine for local development and single-instance deployments.

## Local Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend starts on `http://localhost:5000` by default.

Required backend environment:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/callio
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173
REDIS_URL=
REDIS_KEY_PREFIX=callus
```

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend starts on `http://localhost:5173`.

Required frontend environment:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Try the App

1. Open `http://localhost:5173`.
2. Register two different users.
3. Sign in from two browser windows or profiles.
4. Confirm both users appear online.
5. Start a chat, audio call, or video call from the user list.

For camera and microphone access, use `localhost` in development or HTTPS in
production.

## Available Scripts

### Backend

```bash
npm run dev     # Start backend with nodemon
npm start       # Start backend with node
```

### Frontend

```bash
npm run dev     # Start Vite development server
npm run build   # Build production frontend
npm run preview # Preview production build locally
```

## HTTP API

Base URL: `http://localhost:5000/api`

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Health check |
| `POST` | `/auth/register` | No | Create account and return JWT |
| `POST` | `/auth/login` | No | Login and return JWT |
| `GET` | `/auth/me` | Yes | Return current user |
| `GET` | `/users` | Yes | List other users with presence metadata |
| `GET` | `/users/lookup/:userId` | No | Find a user by public 6-digit ID |
| `GET` | `/messages/:peerId` | Yes | Load chat history with a peer |
| `PUT` | `/messages/read/:peerId` | Yes | Mark messages from a peer as read |

Authenticated routes expect:

```http
Authorization: Bearer <token>
```

## Socket.IO Events

Socket connections are authenticated with the JWT:

```js
io(VITE_SOCKET_URL, {
  auth: { token },
});
```

### Presence

- `presence:bootstrap` - sent to a connecting user with current online and busy IDs
- `presence:update` - broadcast when online or busy state changes

### Chat

- `chat:send` - send a message to another user
- `chat:receive` - receive a new message
- `chat:typing` - send or receive typing state
- `chat:read` - mark a peer's messages as read
- `chat:read-receipt` - receive delivered/read status updates

### Calls

- `call:initiate` - caller sends a WebRTC offer to the callee through the server
- `call:incoming` - callee receives an incoming call
- `call:accept` - callee sends a WebRTC answer
- `call:accepted` - caller receives the answer
- `call:reject` / `call:rejected` - reject an incoming call
- `call:ice-candidate` - relay ICE candidates between peers
- `call:end` / `call:ended` - end an active call

## Realtime Architecture

Call.io uses Socket.IO for authenticated realtime messaging and WebRTC
signaling. Media does not flow through the backend; once signaling completes,
audio and video streams are peer-to-peer between browsers.

The backend stores:

- Users in MongoDB
- Chat messages in MongoDB
- Presence, busy state, and active call sessions in Redis when `REDIS_URL` is set
- Presence, busy state, and active call sessions in memory when Redis is not set

The WebRTC configuration currently uses Google's public STUN server. For
production environments with restrictive NATs, add a TURN server.

## Deployment

Deploy the frontend and backend separately:

- Frontend: Vercel, root directory `frontend`
- Backend: Render, Railway, Fly.io, or another long-running Node host

Do not deploy the Socket.IO backend as a serverless Vercel function. Realtime
signaling needs a long-running Node process.

Frontend production env:

```env
VITE_API_URL=https://your-backend.example.com/api
VITE_SOCKET_URL=https://your-backend.example.com
```

Backend production env:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-strong-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend.example.com
CLIENT_URLS=https://your-frontend.example.com
REDIS_URL=<optional-redis-url>
REDIS_KEY_PREFIX=callus
```

See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for the current
Vercel and Render deployment checklist.

## Troubleshooting

- `Missing required environment variable`: check `backend/.env`.
- `Not allowed by CORS`: add the exact frontend origin to `CLIENT_URLS`.
- `Realtime connection unavailable`: check `VITE_SOCKET_URL` and backend status.
- Camera or microphone prompts do not appear: use `localhost` or HTTPS.
- Calls connect on some networks but not others: configure a TURN server.
- Users do not appear online in production: check Socket.IO connectivity and
  Redis configuration if running more than one backend instance.

## Additional Docs

- [Local setup](docs/SETUP.md)
- [Vercel deployment](docs/VERCEL_DEPLOYMENT.md)
- [Deployment guide](DEPLOYMENT_GUIDE.md)
- [Learning hub](learning-hub/README.md)
