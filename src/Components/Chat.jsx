import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

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

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
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

    try {
      await axios.post(
        BASE_URL + `/api/chat/${userId}`,
        { text: newMsg.text },
        { withCredentials: true }
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m !== newMsg));
      setText(newMsg.text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-base-200">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-base-300 border-b border-base-content/10 shadow-sm shrink-0 z-10">
        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={() => navigate("/connections")}
          title="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {chatUser && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="avatar">
              <div className="w-10 rounded-full ring-2 ring-primary/30">
                <img
                  src={chatUser.photoUrl || fallbackPhoto}
                  alt={chatUser.firstName}
                  onError={(e) => { e.target.src = fallbackPhoto; }}
                />
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">
                {chatUser.firstName} {chatUser.lastName}
              </p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-success"></span>
                Online
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-base-content/40 mt-20">
            <div className="avatar">
              <div className="w-20 rounded-full ring-2 ring-base-content/10">
                <img
                  src={chatUser?.photoUrl || fallbackPhoto}
                  alt={chatUser?.firstName}
                  onError={(e) => { e.target.src = fallbackPhoto; }}
                />
              </div>
            </div>
            <p className="font-semibold text-base-content/60">
              {chatUser?.firstName} {chatUser?.lastName}
            </p>
            <p className="text-sm">You matched! Start the conversation 👋</p>
          </div>
        )}

        {messagesWithDates.map((item, i) => {
          if (item.type === "date") {
            return (
              <div key={`date-${i}`} className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-base-content/10"></div>
                <span className="text-xs text-base-content/40 px-2">{item.label}</span>
                <div className="flex-1 h-px bg-base-content/10"></div>
              </div>
            );
          }

          const msg = item;
          const isMe = msg.senderId === me?._id;
          const nextItem = messagesWithDates[i + 1];
          const isLast = !nextItem || nextItem.type === "date" || (
            nextItem.type === "msg" && nextItem.senderId !== msg.senderId
          );

          return (
            <div
              key={i}
              className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} ${isLast ? "mb-3" : "mb-0.5"}`}
            >
              <div className="w-7 shrink-0">
                {isLast && (
                  <div className="avatar">
                    <div className="w-7 rounded-full">
                      <img
                        src={isMe ? (me?.photoUrl || fallbackPhoto) : (chatUser?.photoUrl || fallbackPhoto)}
                        alt="avatar"
                        onError={(e) => { e.target.src = fallbackPhoto; }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm leading-relaxed wrap-break-word
                    ${isMe
                      ? "bg-primary text-primary-content rounded-br-sm"
                      : "bg-base-300 text-base-content rounded-bl-sm"
                    }
                    ${msg._optimistic ? "opacity-70" : ""}
                  `}
                >
                  {msg.text}
                </div>
                {isLast && msg.createdAt && (
                  <span className="text-xs text-base-content/40 mt-1 px-1">
                    {formatTime(msg.createdAt)}
                    {isMe && <span className="ml-1 text-primary/60">✓✓</span>}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 bg-base-300 border-t border-base-content/10 px-4 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-base-200 rounded-full px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-base-content/40"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="btn btn-primary btn-circle btn-sm shrink-0"
            title="Send"
          >
            {sending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </form>
        <p className="text-xs text-center text-base-content/30 mt-1">Press Enter to send</p>
      </div>
    </div>
  );
};

export default Chat;
