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

    socket.connect();

    socket.on("connect", () => {
      socket.emit("joinRoom", { targetUserId: userId });
      socket.emit("markSeen", { senderId: userId });
    });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => {
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

    socket.on("userTyping", ({ userId: typingUserId, isTyping: typing }) => {
      if (typingUserId === userId) setIsTyping(typing);
    });

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
      if (ack?.error) {
        setMessages((prev) => prev.filter((m) => m !== newMsg));
        setText(newMsg.text);
      }
      setSending(false);
    });

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
    socket.emit("typing", { receiverId: userId, isTyping: true });
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
    <div className="flex justify-center bg-base-200 h-[calc(100vh-64px)]">
      <div className="flex flex-col w-full max-w-2xl h-full">

        {/* ── Header ── */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-4 bg-base-300 shadow-lg z-10 border-b border-base-content/10">
          <button
            className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content"
            onClick={() => navigate("/connections")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {chatUser && (
            <>
              {/* Avatar with online indicator */}
              <div className="relative shrink-0">
                <div className="avatar">
                  <div className="w-11 h-11 rounded-full ring-2 ring-primary/40 ring-offset-2 ring-offset-base-300">
                    <img
                      src={chatUser.photoUrl || fallbackPhoto}
                      alt={chatUser.firstName}
                      onError={(e) => { e.target.src = fallbackPhoto; }}
                    />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-300"></span>
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base leading-tight truncate">{chatUser.firstName} {chatUser.lastName}</p>
                <p className={`text-xs mt-0.5 transition-all duration-300 ${isTyping ? "text-primary font-medium" : "text-success"}`}>
                  {isTyping ? "typing..." : "Online"}
                </p>
              </div>

              {/* Action icons */}
              <div className="flex gap-1">
                <button className="btn btn-ghost btn-circle btn-sm text-base-content/50" title="Voice call">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button className="btn btn-ghost btn-circle btn-sm text-base-content/50" title="Video call">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-0.5 bg-base-200">

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-5 py-16">
              <div className="relative">
                <div className="avatar">
                  <div className="w-24 rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-base-200">
                    <img
                      src={chatUser?.photoUrl || fallbackPhoto}
                      alt={chatUser?.firstName}
                      onError={(e) => { e.target.src = fallbackPhoto; }}
                    />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-success rounded-full border-2 border-base-200"></span>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl">{chatUser?.firstName} {chatUser?.lastName}</p>
                <p className="text-sm text-base-content/50 mt-2">You matched! Start the conversation 👋</p>
              </div>
              <div className="bg-base-300/60 backdrop-blur-sm rounded-2xl px-6 py-3 text-center">
                <p className="text-xs text-base-content/40">Messages are end-to-end encrypted</p>
              </div>
            </div>
          )}

          {messagesWithDates.map((item, i) => {
            /* ── Date separator ── */
            if (item.type === "date") {
              return (
                <div key={`date-${i}`} className="flex items-center justify-center my-6">
                  <span className="text-xs text-base-content/50 bg-base-300/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-base-content/10 shadow-sm">
                    {item.label}
                  </span>
                </div>
              );
            }

            const msg = item;
            const isMe = msg.senderId === me?._id || msg.senderId?._id === me?._id;
            const nextItem = messagesWithDates[i + 1];
            const isLast =
              !nextItem ||
              nextItem.type === "date" ||
              (nextItem.type === "msg" && (nextItem.senderId === me?._id) !== isMe);

            // Bubble corner shape: tail only on last in group
            const sentShape = isLast
              ? "rounded-t-2xl rounded-tl-2xl rounded-bl-2xl rounded-br-md"
              : "rounded-2xl";
            const receivedShape = isLast
              ? "rounded-t-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-md"
              : "rounded-2xl";

            return (
              <div
                key={i}
                className={`flex items-end gap-2 w-full ${isMe ? "flex-row-reverse" : "flex-row"} ${isLast ? "mb-3" : "mb-0.5"}`}
              >
                {/* Avatar — only on last in group */}
                <div className="w-8 shrink-0 self-end">
                  {isLast && (
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full shadow-sm">
                        <img
                          src={isMe ? (me?.photoUrl || fallbackPhoto) : (chatUser?.photoUrl || fallbackPhoto)}
                          alt=""
                          onError={(e) => { e.target.src = fallbackPhoto; }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bubble + meta */}
                <div className={`flex flex-col gap-1 max-w-[68%] ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`
                      px-4 py-2.5 text-sm leading-relaxed wrap-break-word shadow-sm
                      ${isMe
                        ? `bg-linear-to-br from-primary to-primary/85 text-primary-content ${sentShape}`
                        : `bg-base-100 text-base-content border border-base-content/10 ${receivedShape}`
                      }
                      ${msg._optimistic ? "opacity-60" : ""}
                    `}
                  >
                    {msg.text}
                  </div>

                  {/* Timestamp + read receipt (only on last in group) */}
                  {isLast && (
                    <div className={`flex items-center gap-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="text-[10px] text-base-content/40 leading-none">
                        {msg.createdAt ? formatTime(msg.createdAt) : ""}
                      </span>
                      {isMe && (
                        <span className={`text-[11px] leading-none ${msg.seen ? "text-primary" : "text-base-content/30"}`}>
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
                  <div className="w-8 h-8 rounded-full shadow-sm">
                    <img
                      src={chatUser?.photoUrl || fallbackPhoto}
                      alt=""
                      onError={(e) => { e.target.src = fallbackPhoto; }}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-base-100 border border-base-content/10 shadow-sm px-4 py-3 rounded-t-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-md flex gap-1.5 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-base-content/40 animate-bounce [animation-delay:0ms]" />
                <span className="w-2.5 h-2.5 rounded-full bg-base-content/40 animate-bounce [animation-delay:150ms]" />
                <span className="w-2.5 h-2.5 rounded-full bg-base-content/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="shrink-0 px-4 py-4 bg-base-300 border-t border-base-content/10">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            {/* Emoji button */}
            <button type="button" className="btn btn-ghost btn-circle btn-sm text-base-content/40 hover:text-base-content shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Input field */}
            <div className="flex-1 flex items-center bg-base-200 rounded-full px-5 py-3 gap-2 border border-base-content/10 focus-within:border-primary/40 transition-colors">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-base-content/30"
                placeholder="Type a message..."
                value={text}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={sending}
                autoComplete="off"
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className={`btn btn-circle shrink-0 w-12 h-12 min-h-0 border-0 transition-all duration-200
                ${text.trim()
                  ? "bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg hover:shadow-primary/30 hover:scale-105"
                  : "bg-base-200 text-base-content/30 cursor-not-allowed"
                }`}
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
    </div>
  );
};

export default Chat;
