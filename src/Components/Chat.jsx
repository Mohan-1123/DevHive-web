import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import socket from "../utils/socketService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const me = useSelector((state) => state.user);

  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch user info + message history, then set up socket
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, chatRes] = await Promise.all([
          axios.get(BASE_URL + `/api/profile/view/${userId}`, { withCredentials: true }),
          axios.get(BASE_URL + `/api/chat/${userId}`, { withCredentials: true }),
        ]);
        setChatUser(userRes.data.user || userRes.data);
        const msgs = chatRes.data.data || chatRes.data.messages || [];
        setMessages(Array.isArray(msgs) ? msgs : []);
      } catch {
        try {
          const userRes = await axios.get(BASE_URL + `/api/profile/view/${userId}`, { withCredentials: true });
          setChatUser(userRes.data.user || userRes.data);
        } catch {
          setError("Failed to load chat.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Connect socket and join room
    socket.connect();

    socket.on("connect", () => {
      socket.emit("joinRoom", { targetUserId: userId });
      socket.emit("markSeen", { senderId: userId });
    });

    // Receive real-time messages
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => {
        // Replace matching optimistic message (same text, sent by me)
        const optIdx = prev.findIndex(
          (m) => m._optimistic && m.text === msg.text && m.senderId === me?._id
        );
        if (optIdx !== -1) {
          const updated = [...prev];
          updated[optIdx] = msg;
          return updated;
        }
        return [...prev, msg];
      });
    });

    // Show typing indicator from other user
    socket.on("userTyping", ({ userId: typingUserId, isTyping: typing }) => {
      if (typingUserId === userId) setIsTyping(typing);
    });

    // When other user sees our messages
    socket.on("messagesSeen", () => {
      setMessages((prev) =>
        prev.map((m) => (m.senderId === me?._id ? { ...m, seen: true } : m))
      );
    });

    return () => {
      socket.off("connect");
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("messagesSeen");
      socket.disconnect();
      clearTimeout(typingTimeoutRef.current);
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    const newMsg = {
      senderId: me?._id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setText("");
    inputRef.current?.focus();
    setSending(true);

    socket.emit("sendMessage", { receiverId: userId, text: newMsg.text }, (ack) => {
      // If server returns an error via ack callback
      if (ack?.error) {
        setMessages((prev) => prev.filter((m) => m !== newMsg));
        setText(newMsg.text);
      }
      setSending(false);
    });

    // Stop typing indicator
    socket.emit("typing", { receiverId: userId, isTyping: false });
    clearTimeout(typingTimeoutRef.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);

    // Emit typing start
    socket.emit("typing", { receiverId: userId, isTyping: true });

    // Auto-stop typing after 2 seconds of no input
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { receiverId: userId, isTyping: false });
    }, 2000);
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Inject date separators
  const messagesWithDates = [];
  let lastDate = null;
  (Array.isArray(messages) ? messages : []).forEach((msg) => {
    const date = msg.createdAt ? new Date(msg.createdAt).toDateString() : null;
    if (date && date !== lastDate) {
      messagesWithDates.push({ type: "date", label: formatDate(msg.createdAt) });
      lastDate = date;
    }
    messagesWithDates.push({ type: "msg", ...msg });
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="alert alert-error max-w-md"><span>{error}</span></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]" style={{ background: "var(--color-base-200)" }}>

      {/* ── Header ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 shadow-md z-10"
        style={{ background: "var(--color-base-300)", borderBottom: "1px solid oklch(var(--bc)/0.08)" }}>
        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={() => navigate("/connections")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {chatUser && (
          <>
            <div className="avatar">
              <div className="w-10 h-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-300">
                <img
                  src={chatUser.photoUrl || fallbackPhoto}
                  alt={chatUser.firstName}
                  onError={(e) => { e.target.src = fallbackPhoto; }}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base leading-tight truncate">
                {chatUser.firstName} {chatUser.lastName}
              </p>
              <p className={`text-xs flex items-center gap-1 transition-all ${isTyping ? "text-primary" : "text-success"}`}>
                <span className={`inline-block w-2 h-2 rounded-full ${isTyping ? "bg-primary animate-pulse" : "bg-success"}`}></span>
                {isTyping ? "typing..." : "Online"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-20">
            <div className="avatar">
              <div className="w-24 rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-base-200">
                <img
                  src={chatUser?.photoUrl || fallbackPhoto}
                  alt={chatUser?.firstName}
                  onError={(e) => { e.target.src = fallbackPhoto; }}
                />
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">{chatUser?.firstName} {chatUser?.lastName}</p>
              <p className="text-sm text-base-content/50 mt-1">You matched! Say hello 👋</p>
            </div>
          </div>
        )}

        {messagesWithDates.map((item, i) => {
          /* Date separator */
          if (item.type === "date") {
            return (
              <div key={`date-${i}`} className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-base-content/10" />
                <span className="text-xs text-base-content/40 bg-base-200 px-3 py-1 rounded-full border border-base-content/10">
                  {item.label}
                </span>
                <div className="flex-1 h-px bg-base-content/10" />
              </div>
            );
          }

          const msg = item;
          const isMe = msg.senderId === me?._id || msg.senderId?._id === me?._id;
          const nextItem = messagesWithDates[i + 1];
          const isLast =
            !nextItem ||
            nextItem.type === "date" ||
            (nextItem.type === "msg" &&
              (nextItem.senderId === me?._id) !== isMe);

          return (
            <div
              key={i}
              className={`flex items-end gap-2 w-full ${isMe ? "flex-row-reverse" : "flex-row"} ${isLast ? "mb-3" : "mb-0.5"}`}
            >
              {/* Avatar — only on last bubble in group */}
              <div className="w-8 shrink-0 self-end">
                {isLast ? (
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <img
                        src={isMe ? (me?.photoUrl || fallbackPhoto) : (chatUser?.photoUrl || fallbackPhoto)}
                        alt=""
                        onError={(e) => { e.target.src = fallbackPhoto; }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col gap-0.5 max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`
                    px-4 py-2.5 text-sm leading-relaxed wrap-break-word
                    ${isMe
                      ? "bg-primary text-primary-content rounded-t-2xl rounded-bl-2xl rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-t-2xl rounded-br-2xl rounded-bl-sm shadow-sm"
                    }
                    ${msg._optimistic ? "opacity-60" : ""}
                  `}
                >
                  {msg.text}
                </div>

                {/* Timestamp + read receipt */}
                {isLast && (
                  <div className={`flex items-center gap-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <span className="text-[10px] text-base-content/40">
                      {msg.createdAt ? formatTime(msg.createdAt) : ""}
                    </span>
                    {isMe && (
                      <span className={`text-[11px] ${msg.seen ? "text-primary" : "text-base-content/30"}`}>
                        {msg.seen ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 flex-row mb-3">
            <div className="w-8 shrink-0">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full">
                  <img
                    src={chatUser?.photoUrl || fallbackPhoto}
                    alt=""
                    onError={(e) => { e.target.src = fallbackPhoto; }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-base-100 shadow-sm px-4 py-3 rounded-t-2xl rounded-br-2xl rounded-bl-md flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 px-3 py-3"
        style={{ background: "var(--color-base-300)", borderTop: "1px solid oklch(var(--bc)/0.08)" }}>
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-base-200 rounded-full px-4 py-2.5 gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-base-content/40"
              placeholder="Type a message..."
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={sending}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="btn btn-primary btn-circle shrink-0 w-11 h-11 min-h-0"
            title="Send"
          >
            {sending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
