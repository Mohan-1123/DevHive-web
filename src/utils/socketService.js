import { io } from "socket.io-client";

// Strip /api suffix to get the server root for Socket.IO
const serverUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, "") || "/";
const socket = io(serverUrl, {
  withCredentials: true,
  autoConnect: false,
});

export default socket;
