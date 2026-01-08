<p align="center">
  <img src="public/icon.svg" alt="Nexora Logo" width="120" height="120">
</p>

<h1 align="center">Nexora</h1>

<p align="center">
  <strong>Connect Minds. Build Futures.</strong>
</p>

<p align="center">
  A premium, high-security professional networking platform designed for institutional communities.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#api-documentation">API</a> •
  <a href="#security">Security</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Socket.IO-4.7-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO">
  <img src="https://img.shields.io/badge/Render-Deployed-00E5B6?style=for-the-badge&logo=render&logoColor=white" alt="Render">
</p>

---

## 📖 Overview

**Nexora** is a state-of-the-art full-stack professional networking platform tailored for educational and corporate institutions. It focuses on creating secure, high-quality connections within dedicated organizational boundaries. By leveraging intelligent matching and real-time communication, Nexora transforms a simple directory into a vibrant, collaborative ecosystem.

### 🏛️ Intra-College Networking
Nexora is built around the concept of **Institutional Isolation**. Students and professionals connect within their specific college or organization using unique **College Codes**, ensuring a private and relevant networking experience.

---

## ✨ Features

### 🏢 Institutional Admin Console
A dedicated workspace for college administrators to:
- Manage the student network and user accounts.
- Update institution details (Website, Contact, Address) in real-time.
- Monitor community engagement and platform metrics.
- Perform administrative deletions and profile audits.

### 🌐 Smart Institutional Discovery
Intelligent matching algorithm restricted to your institution:
- Connect with peers based on skills (React, Python, etc.) and goals.
- Privacy-first approach: You only see people from your own college.
- **Match Scores**: Instantly see how well you align with other members.

### 💬 Unified Communication Center
Instant messaging system powered by Socket.IO featuring:
- **WebRTC Voice & Video Calls**: High-quality, peer-to-peer calling integrated directly into chats.
- **Media Sharing**: Upload and share images or documents instantly.
- **Real-time Status**: Live online/offline/away indicators and typing states.
- **Notification Badges**: Dynamic red dots in the navigation bar for unread messages.

### 📱 Premium Mobile Experience
Every feature of Nexora is re-engineered for mobile excellence:
- **Responsive Modals**: Full-screen student details and edit views on mobile.
- **Sticky Navigation**: Optimized headers and controls for touch-first interaction.
- **Tactile UI**: High-density information display tailored for smaller screens.

### 💻 Developer Hub
- **Collaborative Code Snippets**: Share and discover code with syntax highlighting.
- **Project Kanban**: Integrated task management for team collaborations.

---

## 🛠️ Tech Stack

### Frontend & UI
- **React 19.2**: Modern UI framework with Concurrent Mode.
- **TailwindCSS**: Premium, utility-first styling for a sleek aesthetic.
- **Framer Motion**: State-of-the-art micro-animations and transitions.
- **Socket.IO Client**: Real-time event synchronization.

### Backend & Infrastructure
- **Node.js & Express**: High-performance API architecture.
- **MongoDB 8.0**: Advanced document-based data storage.
- **Socket.IO**: Real-time signaling and messaging engine.
- **WebRTC**: Peer-to-peer communication for audio/video calls.
- **Redis (Optional)**: High-speed session and data caching.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20.x+
- **MongoDB** 8.x+
- **Git**

### Fast-Track Installation

#### 1. Clone & Set Up
```bash
git clone https://github.com/selvakumaran/Nexora.git
cd Nexora
npm install
cd server && npm install && cd ..
```

#### 2. Configure Environment
Create a `.env` in the `server` folder:
```bash
MONGODB_URI=mongodb://localhost:27017/nexora
JWT_SECRET=your_secret_pin
CLIENT_URL=http://localhost:5173
```

#### 3. Launch Development
Nexora uses a unified development workflow:
```bash
npm run dev # Launches both Vite and the API server
```

---

## 🚢 Deployment (Render Blueprint)

Nexora is optimized for **Render** using a single-web-service architecture.

1. **Root Build Script**: `npm run build` handles both frontend compilation and server setup.
2. **Unified Execution**: `npm start` serves the React app and API from the same process for cost efficiency.
3. **Render Blueprint**: Just connect your repo and click "Apply" using the included `render.yaml`.

---

## 🔐 Security & Privacy
Nexora implements enterprise-grade security protocols:
- **Regex Injection Protection**: All search and filter inputs are sanitized with `escapeRegex` to prevent ReDoS attacks.
- **Institutional Isolation**: API-level enforcement ensures students cannot access data from other colleges.
- **Socket Authorization**: Real-time room joining is strictly validated against chat membership.
- **8-Digit PIN Authentication**: Simplified yet secure PIN-based access system.

---

## 🤝 Contributing
Join the Nexora community!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <strong>Selva Kumaran</strong>
</p>

#### User Routes (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all users (with filters) |
| `GET` | `/:id` | Get user by ID |
| `PUT` | `/profile` | Update current user profile |
| `PUT` | `/skills` | Update skills |
| `PUT` | `/interests` | Update interests |
| `DELETE` | `/account` | Delete account |

#### Chat Routes (`/api/chats`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all user chats |
| `POST` | `/` | Create new chat |
| `GET` | `/:id` | Get chat by ID |
| `DELETE` | `/:id` | Delete chat |

#### Message Routes (`/api/messages`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/chat/:chatId` | Get messages for chat |
| `POST` | `/` | Send new message |
| `PUT` | `/:id/read` | Mark message as read |
| `DELETE` | `/:id` | Delete message |

#### Contact Routes (`/api/contacts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all contacts |
| `POST` | `/request` | Send connection request |
| `PUT` | `/accept/:id` | Accept request |
| `PUT` | `/reject/:id` | Reject request |
| `DELETE` | `/:id` | Remove contact |

#### Code Routes (`/api/code`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get user's snippets |
| `POST` | `/` | Create snippet |
| `GET` | `/:id` | Get snippet by ID |
| `PUT` | `/:id` | Update snippet |
| `DELETE` | `/:id` | Delete snippet |

#### Dashboard Routes (`/api/dashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stats` | Get user statistics |
| `GET` | `/activity` | Get recent activity |

#### Landing Routes (`/api/landing`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stats` | Get platform statistics |
| `GET` | `/skills` | Get popular skills |
| `GET` | `/interests` | Get popular interests |
| `GET` | `/testimonials` | Get testimonials |

---

## 🔌 WebSocket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ userId }` | Join user room |
| `message:send` | `{ chatId, content }` | Send message |
| `typing:start` | `{ chatId }` | User started typing |
| `typing:stop` | `{ chatId }` | User stopped typing |
| `message:read` | `{ messageId }` | Mark message as read |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `{ message }` | New message received |
| `user:online` | `{ userId }` | User came online |
| `user:offline` | `{ userId }` | User went offline |
| `typing:update` | `{ chatId, userId, isTyping }` | Typing indicator |
| `notification:new` | `{ notification }` | New notification |

---

## 🗄️ Database Schema

### User Model

```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  avatar: String,
  bio: String,
  location: String,
  skills: [String],
  interests: [String],
  isOnline: Boolean,
  lastSeen: Date,
  googleId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Chat Model

```javascript
{
  participants: [ObjectId → User],
  lastMessage: ObjectId → Message,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model

```javascript
{
  chat: ObjectId → Chat,
  sender: ObjectId → User,
  content: String,
  type: String (text, image, file),
  readBy: [ObjectId → User],
  createdAt: Date
}
```

### Contact Model

```javascript
{
  requester: ObjectId → User,
  recipient: ObjectId → User,
  status: String (pending, accepted, rejected, blocked),
  createdAt: Date,
  updatedAt: Date
}
```

### CodeSnippet Model

```javascript
{
  author: ObjectId → User,
  title: String,
  description: String,
  code: String,
  language: String,
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Running Tests

```bash
# Frontend tests
npm run test

# Backend tests
cd server
npm run test

# E2E tests
npm run test:e2e
```

---

## 🏗️ Building for Production

### Frontend Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Backend Production

```bash
cd server
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<strong-random-string>
CLIENT_URL=https://your-domain.com
```

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

### Backend (Railway/Render/Heroku)

1. Connect your GitHub repository
2. Set environment variables
3. Set start command: `npm start`
4. Deploy

### Full Stack (Docker)

```dockerfile
# Coming soon
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use ESLint configuration
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Selva Kumaran**

- LinkedIn: [@selva-kumaran](https://www.linkedin.com/in/selva-kumaran-a6529a321/)
- GitHub: [@selvakumaran](https://github.com/selvakumaran)

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI Framework
- [Vite](https://vitejs.dev/) - Build Tool
- [TailwindCSS](https://tailwindcss.com/) - CSS Framework
- [Socket.IO](https://socket.io/) - Real-time Engine
- [MongoDB](https://www.mongodb.com/) - Database
- [Lucide](https://lucide.dev/) - Icon Library
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

<p align="center">
  Made with ❤️ by the Nexora Team
</p>

<p align="center">
  <a href="#top">⬆️ Back to Top</a>
</p>
