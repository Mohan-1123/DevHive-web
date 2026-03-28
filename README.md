# devHive

A developer networking platform — discover developers, send connection requests, and build your professional network.

## Features

- **Discover** — Browse developer profiles one at a time, swipe or click to show interest or skip
- **Connections** — View mutual connections and manage incoming requests (accept / reject)
- **Profile** — View and edit your profile (name, age, gender, photo, about, skills)
- **Auth** — Register and login with JWT cookie-based authentication

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite |
| Routing | React Router DOM v7 |
| State | Redux Toolkit |
| Styling | Tailwind CSS v4 + DaisyUI v5 |
| HTTP | Axios |

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running at `http://localhost:3009`

### Installation

```bash
# Clone the repo
git clone https://github.com/Mohan-1123/DevHive-web.git
cd DevHive-web

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL

# Start dev server
npm run dev
```

App runs at `http://localhost:5173`

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3009
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT cookie |
| POST | `/api/auth/logout` | Clear JWT cookie |
| GET | `/api/profile/view` | Get own profile |
| PATCH | `/api/profile/edit` | Update profile |
| GET | `/api/user/feed` | Paginated discover feed |
| GET | `/api/user/connections` | Get all connections |
| GET | `/api/user/requests/received` | Incoming connection requests |
| POST | `/api/request/send/:status/:userId` | Send interest or ignore |
| POST | `/api/request/review/:status/:requestId` | Accept or reject request |

## Project Structure

```
src/
├── Components/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Discover.jsx
│   ├── Connections.jsx
│   ├── Profile.jsx
│   ├── Home.jsx
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ProtectedRoute.jsx
│   ├── ErrorBoundary.jsx
│   └── NotFound.jsx
├── utils/
│   ├── appStore.js
│   └── userSlice.js
├── App.jsx
└── main.jsx
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```
