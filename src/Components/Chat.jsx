import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import socket from "../utils/socketService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
const MAX_MESSAGE_LENGTH = 1000;

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const me = useSelector((state) => state.user);

  const [chatUser, setChatUser]     = useState(null);
  const [messages, setMessages]     = useState([]);
  const [text, setText]             = useState("");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [sending, setSending]       = useState(false);
  const [isTyping, setIsTyping]     = useState(false);
  const [sendError, setSendError]   = useState("");   // inline send error
  const [isOnline, setIsOnline]     = useState(true); // network status
  const [retrying, setRetrying]     = useState(false);

  const messagesEndRef   = useRef(null);
  const inputRef         = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isMountedRef     = useRef(true);

  // ── Network status detection ──
  useEffect(() => {
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // ── Guard: invalid userId ──
  useEffect(() => {
    if (!userId || userId === "undefined") {
      navigate("/connections", { replace: true });
    }
  }, [userId, navigate]);

  // ── Fetch data + socket setup ──
  const fetchData = useCallback(async () => {
    if (!userId || userId === "undefined") return;
    setLoading(true);
    setError("");
    try {
      const [userRes, chatRes] = await Promise.all([
        axios.get(BASE_URL + `/api/profile/view/${userId}`, { withCredentials: true }),
        axios.get(BASE_URL + `/api/chat/${userId}`,         { withCredentials: true }),
      ]);
      if (!isMountedRef.current) return;
      setChatUser(userRes.data.user || userRes.data);
      const msgs = chatRes.data.data || chatRes.data.messages || [];
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (err) {
      if (!isMountedRef.current) return;
      // Try at least loading the user profile
      try {
        const userRes = await axios.get(BASE_URL + `/api/profile/view/${userId}`, { withCredentials: true });
        if (!isMountedRef.current) return;
        setChatUser(userRes.data.user || userRes.data);
        setMessages([]);
      } catch {
        const msg = err?.response?.status === 401
          ? "Session expired. Please log in again."
          : err?.response?.status === 404
          ? "This user could not be found."
          : err?.response?.status >= 500
          ? "Server error. Please try again later."
          : "Failed to load chat. Check your connection.";
        setError(msg);
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    socket.connect();

    socket.on("connect", () => {
      socket.emit("joinRoom",  { targetUserId: userId });
      socket.emit("markSeen", { senderId: userId });
    });

    socket.on("connect_error", () => {
      if (isMountedRef.current) setIsOnline(false);
    });

    socket.on("reconnect", () => {
      if (isMountedRef.current) setIsOnline(true);
    });

    socket.on("receiveMessage", (msg) => {
      if (!isMountedRef.current) return;
      // Validate incoming message shape
      if (!msg || typeof msg !== "object" || !msg.text) return;
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
      if (isMountedRef.current && typingUserId === userId) setIsTyping(typing);
    });

    socket.on("messagesSeen", () => {
      if (!isMountedRef.current) return;
      setMessages((prev) =>
        prev.map((m) => (m.senderId === me?._id ? { ...m, seen: true } : m))
      );
    });

    return () => {
      isMountedRef.current = false;
      socket.off("connect");
      socket.off("connect_error");
      socket.off("reconnect");
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("messagesSeen");
      socket.disconnect();
      clearTimeout(typingTimeoutRef.current);
    };
  }, [userId, me?._id, fetchData]);

  // ── Auto scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Send message ──
  const handleSend = (e) => {
    e.preventDefault();
    setSendError("");

    const trimmed = text.trim();
    if (!trimmed || sending) return;

    // Edge case: message too long
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setSendError(`Message too long (max ${MAX_MESSAGE_LENGTH} characters).`);
      return;
    }

    // Edge case: not connected
    if (!socket.connected) {
      setSendError("Not connected. Please wait and try again.");
      return;
    }

    // Edge case: not logged in
    if (!me?._id) {
      setSendError("Session expired. Please log in again.");
      return;
    }

    const newMsg = {
      senderId:    me._id,
      text:        trimmed,
      createdAt:   new Date().toISOString(),
      _optimistic: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setText("");
    inputRef.current?.focus();
    setSending(true);

    socket.emit("sendMessage", { receiverId: userId, text: trimmed }, (ack) => {
      if (!isMountedRef.current) return;
      if (ack?.error) {
        setMessages((prev) => prev.filter((m) => m !== newMsg));
        setText(trimmed);
        setSendError(ack.error || "Failed to send. Please try again.");
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
    const val = e.target.value;
    // Edge case: cap input at max length
    if (val.length > MAX_MESSAGE_LENGTH) return;
    setText(val);
    setSendError("");
    socket.emit("typing", { receiverId: userId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { receiverId: userId, isTyping: false });
    }, 2000);
  };

  const handleRetry = async () => {
    setRetrying(true);
    await fetchData();
    setRetrying(false);
  };

  // ── Formatters ──
  const formatTime = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      const d         = new Date(iso);
      const today     = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === today.toDateString())     return "Today";
      if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch { return ""; }
  };

  // ── Build messages with date separators ──
  const messagesWithDates = [];
  let lastDate = null;
  (Array.isArray(messages) ? messages : []).forEach((msg) => {
    if (!msg || typeof msg !== "object") return;
    const date = msg.createdAt ? new Date(msg.createdAt).toDateString() : null;
    if (date && date !== lastDate) {
      messagesWithDates.push({ type: "date", label: formatDate(msg.createdAt) });
      lastDate = date;
    }
    messagesWithDates.push({ type: "msg", ...msg });
  });

  const charsLeft = MAX_MESSAGE_LENGTH - text.length;
  const nearLimit = charsLeft <= 100;

  // ══════════════════════════════════════════
  // LOADING STATE
  // ══════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-base-200">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/30 to-secondary/30 animate-pulse" />
            <span className="loading loading-spinner loading-lg text-primary absolute inset-0 m-auto" />
          </div>
          <p className="text-base-content/40 text-sm font-medium tracking-wide animate-pulse">
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // ERROR STATE
  // ══════════════════════════════════════════
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-base-200 px-4">
        <div className="bg-base-100 rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-base-content/10">
          <div className="text-5xl mb-4">😕</div>
          <p className="font-bold text-lg mb-2">Something went wrong</p>
          <p className="text-base-content/50 text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              className="btn btn-primary btn-sm rounded-full px-6"
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? <span className="loading loading-spinner loading-xs" /> : "Try Again"}
            </button>
            <button
              className="btn btn-ghost btn-sm rounded-full px-6"
              onClick={() => navigate("/connections")}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // MAIN CHAT UI
  // ══════════════════════════════════════════
  return (
    <div className="flex bg-base-200 h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex flex-col w-full h-full">

        {/* ── Offline banner ── */}
        {!isOnline && (
          <div className="shrink-0 flex items-center justify-center gap-2 py-2 bg-warning/15 border-b border-warning/30">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <p className="text-xs font-semibold text-warning">No internet connection — messages may not send</p>
          </div>
        )}

        {/* ══ HEADER ══ */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-base-100 border-b border-base-content/8 z-10 backdrop-blur-xl">

          {/* Back button */}
          <button
            className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-primary hover:bg-primary/10 transition-all"
            onClick={() => navigate("/connections")}
            aria-label="Back to connections"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {chatUser ? (
            <>
              {/* Avatar */}
              <div className="relative shrink-0 cursor-pointer group">
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary/30 ring-offset-2 ring-offset-base-100 group-hover:ring-primary/60 transition-all">
                  <img
                    src={chatUser.photo || chatUser.photoUrl || fallbackPhoto}
                    alt={`${chatUser.firstName || "User"}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = fallbackPhoto; }}
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-base-100 shadow-sm" />
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base leading-tight truncate text-base-content">
                  {chatUser.firstName || "Unknown"} {chatUser.lastName || ""}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isTyping ? (
                    <>
                      <span className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                      </span>
                      <span className="text-xs text-primary font-semibold">typing...</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="text-xs text-base-content/50">Online</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action icons */}
              <div className="flex gap-1">
                <button
                  className="btn btn-ghost btn-circle btn-sm text-base-content/40 hover:text-primary hover:bg-primary/10 transition-all"
                  title="Voice call"
                  aria-label="Voice call"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button
                  className="btn btn-ghost btn-circle btn-sm text-base-content/40 hover:text-primary hover:bg-primary/10 transition-all"
                  title="Video call"
                  aria-label="Video call"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.276A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                </button>
                <button
                  className="btn btn-ghost btn-circle btn-sm text-base-content/40 hover:text-primary hover:bg-primary/10 transition-all"
                  title="More options"
                  aria-label="More options"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            /* Header skeleton when chatUser not yet loaded */
            <div className="flex items-center gap-3 flex-1">
              <div className="w-11 h-11 rounded-full bg-base-content/10 animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-3 rounded-full bg-base-content/10 animate-pulse" />
                <div className="w-16 h-2 rounded-full bg-base-content/8 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* ══ MESSAGES AREA ══ */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-0.5 min-h-0"
          style={{ background: "radial-gradient(ellipse at top, oklch(var(--b2) / 0.6), oklch(var(--b2)))" }}
        >
          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center flex-1 gap-6 py-16">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 blur-xl scale-125" />
                <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/25 ring-offset-4 ring-offset-base-200 shadow-2xl">
                  <img
                    src={chatUser?.photo || chatUser?.photoUrl || fallbackPhoto}
                    alt={chatUser?.firstName || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = fallbackPhoto; }}
                  />
                </div>
                <span className="absolute bottom-2 right-2 w-5 h-5 bg-success rounded-full border-2 border-base-200 shadow-sm" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-bold text-2xl text-base-content">
                  {chatUser?.firstName || "User"} {chatUser?.lastName || ""}
                </p>
                <p className="text-sm text-base-content/40">You&apos;re now connected</p>
              </div>
              <div className="bg-base-100/70 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-base-content/8 shadow-lg max-w-xs">
                <p className="text-2xl mb-2">👋</p>
                <p className="text-sm font-medium text-base-content/70">Say hello and start the conversation!</p>
                <p className="text-xs text-base-content/30 mt-2">🔒 Messages are end-to-end encrypted</p>
              </div>
            </div>
          )}

          {/* Message list */}
          {messagesWithDates.map((item, i) => {

            /* Date separator */
            if (item.type === "date") {
              return (
                <div key={`date-${i}`} className="flex items-center justify-center my-6 gap-3">
                  <div className="flex-1 h-px bg-linear-to-r from-transparent to-base-content/10" />
                  <span className="text-[11px] font-semibold text-base-content/40 bg-base-100/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-base-content/8 shadow-sm tracking-wide">
                    {item.label}
                  </span>
                  <div className="flex-1 h-px bg-linear-to-l from-transparent to-base-content/10" />
                </div>
              );
            }

            const msg          = item;
            const isMe         = msg.senderId === me?._id || msg.senderId?._id === me?._id;
            const nextItem     = messagesWithDates[i + 1];
            const isLastInGroup =
              !nextItem ||
              nextItem.type === "date" ||
              (nextItem.type === "msg" && (nextItem.senderId === me?._id) !== isMe);

            const sentShape     = isLastInGroup ? "rounded-t-2xl rounded-tl-2xl rounded-bl-2xl rounded-br-sm"  : "rounded-2xl";
            const receivedShape = isLastInGroup ? "rounded-t-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm" : "rounded-2xl";

            return (
              <div
                key={msg._id || i}
                className={`flex items-end gap-2 w-full ${isMe ? "flex-row-reverse" : "flex-row"} ${isLastInGroup ? "mb-3" : "mb-0.5"}`}
              >
                {/* Avatar */}
                <div className="w-8 shrink-0 self-end">
                  {isLastInGroup && (
                    <div className="w-8 h-8 rounded-full overflow-hidden shadow ring-1 ring-base-content/10">
                      <img
                        src={isMe ? (me?.photo || me?.photoUrl || fallbackPhoto) : (chatUser?.photo || chatUser?.photoUrl || fallbackPhoto)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = fallbackPhoto; }}
                      />
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col gap-1 max-w-[68%] ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`
                      px-4 py-2.5 text-sm leading-relaxed wrap-break-word shadow-md transition-opacity
                      ${isMe
                        ? `bg-linear-to-br from-primary to-primary/80 text-primary-content ${sentShape}`
                        : `bg-base-100 text-base-content border border-base-content/8 ${receivedShape}`
                      }
                      ${msg._optimistic ? "opacity-50" : "opacity-100"}
                    `}
                  >
                    {/* Guard: render only string text */}
                    {typeof msg.text === "string" ? msg.text : ""}
                  </div>

                  {/* Timestamp + read receipt */}
                  {isLastInGroup && (
                    <div className={`flex items-center gap-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="text-[10px] text-base-content/35 leading-none">
                        {msg.createdAt ? formatTime(msg.createdAt) : ""}
                      </span>
                      {isMe && (
                        <span className={`text-[11px] leading-none font-bold ${msg.seen ? "text-primary" : "text-base-content/25"}`}>
                          {msg._optimistic ? "🕐" : msg.seen ? "✓✓" : "✓"}
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
              <div className="w-8 h-8 rounded-full overflow-hidden shadow ring-1 ring-base-content/10">
                <img
                  src={chatUser?.photo || chatUser?.photoUrl || fallbackPhoto}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = fallbackPhoto; }}
                />
              </div>
              <div className="bg-base-100 border border-base-content/8 shadow-md px-5 py-3.5 rounded-t-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ══ INPUT BAR ══ */}
        <div className="shrink-0 px-4 py-3.5 bg-base-100 border-t border-base-content/8 backdrop-blur-xl">

          {/* Send error */}
          {sendError && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-xs text-error font-medium">⚠ {sendError}</span>
              <button
                className="text-xs text-base-content/30 hover:text-base-content ml-auto"
                onClick={() => setSendError("")}
              >
                ✕
              </button>
            </div>
          )}

          {/* Character counter */}
          {nearLimit && text.length > 0 && (
            <div className="flex justify-end mb-1 px-1">
              <span className={`text-xs font-medium ${charsLeft <= 20 ? "text-error" : "text-warning"}`}>
                {charsLeft} characters left
              </span>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2.5">
            {/* Emoji button */}
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-sm text-base-content/35 hover:text-primary hover:bg-primary/10 transition-all shrink-0"
              aria-label="Emoji"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Input field */}
            <div className={`flex-1 flex items-center bg-base-200 rounded-full px-5 py-2.5 gap-2 border transition-all duration-200
              ${sendError ? "border-error/40" : text ? "border-primary/40" : "border-base-content/8"}`}
            >
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-base-content/30 text-base-content"
                placeholder="Type a message..."
                value={text}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={sending || !isOnline}
                autoComplete="off"
                maxLength={MAX_MESSAGE_LENGTH}
                aria-label="Message input"
              />
              <button
                type="button"
                className="text-base-content/25 hover:text-primary transition-colors shrink-0"
                aria-label="Attach file"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!text.trim() || sending || !isOnline}
              aria-label="Send message"
              className={`btn btn-circle shrink-0 w-11 h-11 min-h-0 border-0 transition-all duration-200
                ${text.trim() && isOnline
                  ? "bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg shadow-primary/25 hover:scale-105 hover:shadow-primary/40"
                  : "bg-base-200 text-base-content/25 cursor-not-allowed"
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
