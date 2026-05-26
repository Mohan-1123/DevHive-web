import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
const UNDO_MS = 5000;

/* ══════════════ Shared presentational pieces ══════════════ */

const SkeletonCard = () => (
  <div className="bg-base-300 rounded-2xl p-4 flex items-center gap-4 border border-base-content/10 animate-pulse">
    <div className="w-16 h-16 rounded-full bg-base-content/10 shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-4 bg-base-content/10 rounded-full w-2/5" />
      <div className="h-3 bg-base-content/10 rounded-full w-1/4" />
      <div className="h-3 bg-base-content/10 rounded-full w-3/5" />
      <div className="flex gap-1 mt-1">
        <div className="h-5 w-14 bg-base-content/10 rounded-full" />
        <div className="h-5 w-16 bg-base-content/10 rounded-full" />
      </div>
    </div>
    <div className="w-20 h-9 bg-base-content/10 rounded-xl shrink-0" />
  </div>
);

const Avatar = ({ user }) => (
  <img
    src={user.photo || user.photoUrl || fallbackPhoto}
    alt={user.firstName}
    onError={(e) => { e.target.src = fallbackPhoto; }}
    className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20 ring-offset-2 ring-offset-base-300 shrink-0"
  />
);

const UserInfo = ({ user }) => (
  <div className="flex-1 min-w-0">
    <h2 className="font-bold text-base truncate">{user.firstName} {user.lastName}</h2>
    <div className="flex flex-wrap gap-1.5 text-xs text-base-content/50 mt-0.5">
      {user.age && <span>{user.age} yrs</span>}
      {user.age && user.gender && <span>·</span>}
      {user.gender && <span className="capitalize">{user.gender}</span>}
    </div>
    {user.about && <p className="text-xs text-base-content/60 mt-1 line-clamp-1">{user.about}</p>}
    {user.skills?.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-2">
        {user.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="badge badge-primary badge-outline badge-sm rounded-full text-[10px]">{skill}</span>
        ))}
        {user.skills.length > 3 && (
          <span className="badge badge-ghost badge-sm rounded-full text-[10px]">+{user.skills.length - 3}</span>
        )}
      </div>
    )}
  </div>
);

const EmptyState = ({ icon, title, subtitle, ctaLabel, ctaHref }) => (
  <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 bg-base-300/60 border border-dashed border-base-content/15 rounded-2xl fade-up">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
      style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.2)" }}
    >
      {icon}
    </div>
    <div className="text-center">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-base-content/50 text-sm mt-1 max-w-xs">{subtitle}</p>
    </div>
    {ctaLabel && ctaHref && (
      <Link
        to={ctaHref}
        className="mt-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 3px 14px rgba(99,102,241,0.35)" }}
      >
        {ctaLabel}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    )}
  </div>
);

const ErrorAlert = ({ message, onRetry }) => (
  <div className="flex items-center justify-center py-16 px-4">
    <div className="flex flex-col items-center gap-3 bg-error/8 border border-error/20 text-error rounded-xl px-5 py-4 text-sm max-w-md">
      <div className="flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-error/15 hover:bg-error/25 border border-error/30 transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try again
        </button>
      )}
    </div>
  </div>
);

/* ══════════════ Cards ══════════════ */

const ConnectionCard = ({ user, onMessage, onOpenProfile }) => (
  <div
    onClick={() => onOpenProfile(user._id)}
    className="bg-base-300 rounded-2xl p-4 flex items-center gap-4 border border-base-content/10 hover:border-primary/25 hover:shadow-md transition-all duration-200 cursor-pointer fade-up"
  >
    <Avatar user={user} />
    <UserInfo user={user} />
    <button
      onClick={(e) => { e.stopPropagation(); onMessage(user._id); }}
      className="btn btn-sm rounded-xl shrink-0 border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-content transition-all gap-1.5"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      Message
    </button>
  </div>
);

const RequestCard = ({ request, onAccept, onReject, onOpenProfile }) => {
  const sender = request.fromUserId;
  return (
    <div
      onClick={() => onOpenProfile(sender._id)}
      className="bg-base-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-base-content/10 hover:border-primary/25 transition-all cursor-pointer fade-up"
    >
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Avatar user={sender} />
        <div className="flex-1 sm:hidden"><UserInfo user={sender} /></div>
      </div>
      <div className="hidden sm:block flex-1 min-w-0"><UserInfo user={sender} /></div>
      <div className="flex gap-2 w-full sm:w-auto shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onAccept(request); }}
          className="btn btn-sm rounded-xl flex-1 sm:flex-none bg-success/10 text-success border border-success/30 hover:bg-success hover:text-white transition-all gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Accept
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onReject(request); }}
          className="btn btn-sm rounded-xl flex-1 sm:flex-none bg-error/10 text-error border border-error/30 hover:bg-error hover:text-white transition-all gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reject
        </button>
      </div>
    </div>
  );
};

/* ══════════════ Toast with undo + countdown ══════════════ */

const Toast = ({ toast, onDismiss }) => {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 min-w-72 max-w-[90vw] bg-base-300 border border-base-content/15 rounded-xl shadow-2xl overflow-hidden fade-up"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isError ? "bg-error/15 text-error" : "bg-success/15 text-success"}`}>
          {isError ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-sm text-base-content flex-1">{toast.message}</span>
        {toast.onUndo && (
          <button
            onClick={toast.onUndo}
            className="text-xs font-semibold text-primary hover:text-primary/80 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
          >
            Undo
          </button>
        )}
        <button
          onClick={onDismiss}
          className="text-base-content/30 hover:text-base-content/60 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {toast.onUndo && (
        <div className="h-0.5 bg-base-content/5">
          <div
            className="h-full bg-primary countdown"
            style={{ animationDuration: `${UNDO_MS}ms` }}
          />
        </div>
      )}
    </div>
  );
};

/* ══════════════ Profile peek modal ══════════════ */

const ProfilePeekModal = ({ userId, open, onClose, cache }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || !userId) return;
    if (cache.current.has(userId)) {
      setUser(cache.current.get(userId));
      setError("");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    setUser(null);
    axios
      .get(BASE_URL + `/api/profile/view/${userId}`, { withCredentials: true })
      .then((res) => {
        const u = res.data.user || res.data.data || res.data;
        cache.current.set(userId, u);
        setUser(u);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load profile."))
      .finally(() => setLoading(false));
  }, [open, userId, cache]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-base-200 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-base-content/10 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-content/8">
          <span className="text-sm font-semibold text-base-content/70">Profile</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-base-content/40 hover:text-base-content hover:bg-base-content/5 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center gap-4 py-6 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-base-content/10" />
              <div className="h-5 w-32 bg-base-content/10 rounded-full" />
              <div className="h-3 w-24 bg-base-content/10 rounded-full" />
              <div className="h-3 w-48 bg-base-content/10 rounded-full" />
            </div>
          )}

          {error && !loading && <ErrorAlert message={error} />}

          {user && !loading && (
            <div className="flex flex-col items-center text-center">
              <img
                src={user.photo || user.photoUrl || fallbackPhoto}
                alt={user.firstName}
                onError={(e) => { e.target.src = fallbackPhoto; }}
                className="w-24 h-24 rounded-full object-cover ring-2 ring-primary/25 ring-offset-4 ring-offset-base-200 mb-4"
              />
              <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
              <div className="flex gap-1.5 text-xs text-base-content/50 mt-1">
                {user.age && <span>{user.age} yrs</span>}
                {user.age && user.gender && <span>·</span>}
                {user.gender && <span className="capitalize">{user.gender}</span>}
              </div>
              {user.about && (
                <p className="text-sm text-base-content/70 mt-4 leading-relaxed">{user.about}</p>
              )}
              {user.skills?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {user.skills.map((skill) => (
                    <span key={skill} className="badge badge-primary badge-outline badge-sm rounded-full">{skill}</span>
                  ))}
                </div>
              )}

              <button
                onClick={() => { onClose(); navigate(`/chat/${user._id}`); }}
                className="mt-6 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 3px 14px rgba(99,102,241,0.35)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Send message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════ Tab bar ══════════════ */

const TabBar = ({ activeTab, onChange, pendingCount }) => (
  <div className="flex gap-1 mb-6 bg-base-300 p-1 rounded-2xl w-full sm:w-fit border border-base-content/10">
    {[
      { id: "connections", label: "My Connections", count: null },
      { id: "pending", label: "Pending Requests", count: pendingCount },
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          activeTab === tab.id
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/60 hover:text-base-content"
        }`}
      >
        {tab.label}
        {tab.count > 0 && (
          <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
            activeTab === tab.id
              ? "bg-primary-content/20 text-primary-content"
              : "bg-primary text-primary-content"
          }`}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

/* ══════════════ Main page ══════════════ */

const Connections = () => {
  const [activeTab, setActiveTab]     = useState("connections");
  const [connections, setConnections] = useState(null);
  const [requests, setRequests]       = useState(null);
  const [loading, setLoading]         = useState({ connections: false, requests: false });
  const [fetched, setFetched]         = useState({ connections: false, requests: false });
  const [error, setError]             = useState({ connections: "", requests: "" });
  const [toast, setToast]             = useState(null);
  const [peekUserId, setPeekUserId]   = useState(null);

  const pendingActions = useRef(new Map());   // requestId → { status, timeoutId, request }
  const profileCache   = useRef(new Map());   // userId → user object
  const toastTimeoutRef = useRef(null);
  const navigate = useNavigate();

  /* Lazy fetches — each tab fetched exactly once per mount (success or failure) */
  useEffect(() => {
    if (activeTab === "connections" && !fetched.connections && !loading.connections) {
      setLoading((l) => ({ ...l, connections: true }));
      axios
        .get(BASE_URL + "/api/user/connections", { withCredentials: true })
        .then((res) => setConnections(res.data.data || []))
        .catch((err) => setError((e) => ({ ...e, connections: err.response?.data?.message || "Failed to load connections." })))
        .finally(() => {
          setFetched((f) => ({ ...f, connections: true }));
          setLoading((l) => ({ ...l, connections: false }));
        });
    }
    if (activeTab === "pending" && !fetched.requests && !loading.requests) {
      setLoading((l) => ({ ...l, requests: true }));
      axios
        .get(BASE_URL + "/api/user/requests/received", { withCredentials: true })
        .then((res) => setRequests(res.data.data || []))
        .catch((err) => setError((e) => ({ ...e, requests: err.response?.data?.message || "Failed to load requests." })))
        .finally(() => {
          setFetched((f) => ({ ...f, requests: true }));
          setLoading((l) => ({ ...l, requests: false }));
        });
    }
  }, [activeTab, fetched.connections, fetched.requests, loading.connections, loading.requests]);

  const retryConnections = () => {
    setError((e) => ({ ...e, connections: "" }));
    setFetched((f) => ({ ...f, connections: false }));
  };
  const retryRequests = () => {
    setError((e) => ({ ...e, requests: "" }));
    setFetched((f) => ({ ...f, requests: false }));
  };

  /* Flush pending actions on unmount so user's intent isn't lost */
  useEffect(() => {
    const pending = pendingActions.current;
    return () => {
      pending.forEach(({ status, timeoutId, request }) => {
        clearTimeout(timeoutId);
        axios
          .post(BASE_URL + `/api/request/review/${status}/${request._id}`, {}, { withCredentials: true })
          .then(() => window.dispatchEvent(new Event("requests:changed")))
          .catch(() => {});
      });
      pending.clear();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const clearToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = null;
    setToast(null);
  };

  const showToast = (next, autoDismissMs = 4000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(next);
    if (autoDismissMs) {
      toastTimeoutRef.current = setTimeout(() => setToast(null), autoDismissMs);
    }
  };

  const scheduleReview = (status, request) => {
    setRequests((prev) => (prev || []).filter((r) => r._id !== request._id));

    const timeoutId = setTimeout(async () => {
      try {
        await axios.post(
          BASE_URL + `/api/request/review/${status}/${request._id}`,
          {},
          { withCredentials: true }
        );
        if (status === "accepted") {
          setConnections((prev) => (prev ? [request.fromUserId, ...prev] : prev));
        }
        window.dispatchEvent(new Event("requests:changed"));
      } catch {
        setRequests((prev) => [request, ...(prev || [])]);
        showToast({ type: "error", message: "Action failed. Restored." });
      } finally {
        pendingActions.current.delete(request._id);
      }
    }, UNDO_MS);

    pendingActions.current.set(request._id, { status, timeoutId, request });

    showToast(
      {
        type: "success",
        message: `Request from ${request.fromUserId.firstName} ${status === "accepted" ? "accepted" : "rejected"}`,
        onUndo: () => {
          clearTimeout(timeoutId);
          pendingActions.current.delete(request._id);
          setRequests((prev) => [request, ...(prev || [])]);
          clearToast();
        },
      },
      UNDO_MS
    );
  };

  const handleOpenProfile = (userId) => setPeekUserId(userId);
  const handleMessage     = (userId) => navigate(`/chat/${userId}`);

  const pendingCount = requests?.length ?? 0;

  /* Body rendering */
  const renderConnections = () => {
    if (loading.connections) return <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;
    if (error.connections)   return <ErrorAlert message={error.connections} onRetry={retryConnections} />;
    if (!connections?.length) return (
      <EmptyState
        icon="🤝"
        title="No connections yet"
        subtitle="Start discovering developers to make your first connection."
        ctaLabel="Discover developers"
        ctaHref="/discover"
      />
    );
    return (
      <div className="flex flex-col gap-3">
        {connections.map((user) => (
          <ConnectionCard
            key={user._id}
            user={user}
            onMessage={handleMessage}
            onOpenProfile={handleOpenProfile}
          />
        ))}
      </div>
    );
  };

  const renderRequests = () => {
    if (loading.requests) return <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;
    if (error.requests)   return <ErrorAlert message={error.requests} onRetry={retryRequests} />;
    if (!requests?.length) return (
      <EmptyState
        icon="📭"
        title="No pending requests"
        subtitle="When someone sends you a connection request, it'll appear here."
      />
    );
    return (
      <div className="flex flex-col gap-3">
        {requests.map((req) => (
          <RequestCard
            key={req._id}
            request={req}
            onAccept={(r) => scheduleReview("accepted", r)}
            onReject={(r) => scheduleReview("rejected", r)}
            onOpenProfile={handleOpenProfile}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp    { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
        @keyframes countdown { from { width:100% } to { width:0% } }
        .fade-up   { animation: fadeUp 0.3s ease both }
        .fade-in   { animation: fadeIn 0.2s ease both }
        .countdown { animation: countdown linear forwards }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .fade-in, .countdown { animation: none !important }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 pb-24 sm:pb-8">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Connections</h1>
          <p className="text-sm text-base-content/45 mt-1">
            {connections?.length > 0 && `${connections.length} ${connections.length === 1 ? "connection" : "connections"}`}
            {connections?.length > 0 && pendingCount > 0 && " · "}
            {pendingCount > 0 && `${pendingCount} pending`}
            {!connections?.length && !pendingCount && "Manage your network"}
          </p>
        </div>

        <TabBar activeTab={activeTab} onChange={setActiveTab} pendingCount={pendingCount} />

        {activeTab === "connections" ? renderConnections() : renderRequests()}
      </div>

      <Toast toast={toast} onDismiss={clearToast} />

      <ProfilePeekModal
        open={!!peekUserId}
        userId={peekUserId}
        onClose={() => setPeekUserId(null)}
        cache={profileCache}
      />
    </>
  );
};

export default Connections;
