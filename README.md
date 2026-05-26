# devHive 🐝

> **A developer-first networking platform** — discover other developers, connect, chat in real-time, and build your professional network.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

---

## What is devHive?

devHive is a social networking app built exclusively for developers. Think of it as a swipe-style discovery feed for dev networking — browse developer profiles, send connection requests, accept or reject incoming ones, and chat in real-time with your connections.

Whether you're looking for a co-founder, an open-source collaborator, or just want to grow your dev network — devHive brings the right people to you.

---

## 🚀 Pages & Features

### 🏠 Home
Public landing page introducing devHive with a hero section, feature highlights, and call-to-action buttons to sign up or log in.

### 🔍 Discover
A swipe-style card feed of developer profiles. Each card shows the developer's photo, name, age, bio, and skills. You can:
- **Like** — send a connection request
- **Skip** — pass on the profile
- Cards animate out on action; the next profile loads automatically

### 🤝 Connections
Two-tab view:
- **Requests** — incoming connection requests you can Accept or Reject
- **Connections** — your accepted connections, each with a "Message" button to open chat

### 💬 Chat
Real-time 1-on-1 messaging powered by Socket.IO. Features:
- Live message delivery (no refresh needed)
- Typing indicators
- Chat history loaded on open
- Clean messenger-style UI with message bubbles

### 👤 Profile
Full profile editor with a live preview card on the side. Edit:
- First & last name
- Age and gender
- Profile photo — drag-and-drop or tap to upload directly from your device (uploaded to Cloudinary with a real-time progress bar)
- About / bio (280 char limit)
- Skills (chip-style tag input, up to 20)

Profile completeness bar shows how filled-in your profile is.

### 💎 Premium
Subscription page to unlock premium features via Razorpay payment. Shows plan details and a one-click checkout flow.

### 🔐 Auth
- **Signup** — multi-step flow: account details → profile info → optional photo upload
- **Login** — email & password or **Google OAuth** (one-click sign in)
- Sessions are cookie-based (JWT), persisted across page reloads

---

## 🎨 Design

- **Dark theme** throughout using DaisyUI
- **Glassmorphism** cards and navbars with soft gradients
- **Mobile-first** — responsive on all screen sizes with a fixed bottom nav on mobile
- Smooth animations on card actions, toasts, and page transitions

---

## 📄 License

MIT © devHive
