import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

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
  <div className="relative shrink-0">
    <img
      src={user.photoUrl || fallbackPhoto}
      alt={`${user.firstName}`}
      onError={(e) => { e.target.src = fallbackPhoto; }}
      className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20 ring-offset-2 ring-offset-base-300"
    />
  </div>
);

const UserInfo = ({ user }) => (
  <div className="flex-1 min-w-0">
    <h2 className="font-bold text-base truncate">{user.firstName} {user.lastName}</h2>
    <div className="flex flex-wrap gap-1.5 text-xs text-base-content/50 mt-0.5">
      {user.age && <span>{user.age} yrs</span>}
      {user.age && user.gender && <span>·</span>}
      {user.gender && <span className="capitalize">{user.gender}</span>}
    </div>
    {user.about && (
      <p className="text-xs text-base-content/60 mt-1 line-clamp-1">{user.about}</p>
    )}
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

const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 px-4">
    <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center text-4xl border border-base-content/10">
      {icon}
    </div>
    <div className="text-center">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-base-content/50 text-sm mt-1 max-w-xs">{subtitle}</p>
    </div>
  </div>
);

// ── My Connections ──────────────────────────────────────────────
const MyConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(BASE_URL + "/api/user/connections", { withCredentials: true })
      .then((res) => setConnections(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load connections."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;
  if (error) return <ErrorAlert message={error} />;
  if (connections.length === 0)
    return <EmptyState icon="🤝" title="No Connections Yet" subtitle="Start discovering developers and make your first connection!" />;

  return (
    <div className="flex flex-col gap-3">
      {connections.map((conn) => (
        <div key={conn._id} className="bg-base-300 rounded-2xl p-4 flex items-center gap-4 border border-base-content/10 hover:border-primary/20 hover:shadow-md transition-all duration-200">
          <Avatar user={conn} />
          <UserInfo user={conn} />
          <button
            className="btn btn-sm rounded-xl shrink-0 border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-content transition-all gap-1.5"
            onClick={() => navigate(`/chat/${conn._id}`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message
          </button>
        </div>
      ))}
    </div>
  );
};

// ── Pending Requests ────────────────────────────────────────────
const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    axios
      .get(BASE_URL + "/api/user/requests/received", { withCredentials: true })
      .then((res) => setRequests(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load requests."))
      .finally(() => setLoading(false));
  }, []);

  const handleReview = async (status, requestId) => {
    setActionLoading(requestId + status);
    try {
      await axios.post(BASE_URL + `/api/request/review/${status}/${requestId}`, {}, { withCredentials: true });
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) return <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;
  if (error) return <ErrorAlert message={error} />;
  if (requests.length === 0)
    return <EmptyState icon="📭" title="No Pending Requests" subtitle="You have no connection requests at the moment." />;

  return (
    <div className="flex flex-col gap-3">
      {requests.map((req) => {
        const sender = req.fromUserId;
        return (
          <div key={req._id} className="bg-base-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-base-content/10 hover:border-primary/20 transition-all">
            <Avatar user={sender} />
            <UserInfo user={sender} />
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <button
                className="btn btn-sm rounded-xl flex-1 sm:flex-none bg-success/10 text-success border border-success/30 hover:bg-success hover:text-white transition-all gap-1"
                disabled={!!actionLoading}
                onClick={() => handleReview("accepted", req._id)}
              >
                {actionLoading === req._id + "accepted" ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Accept
                  </>
                )}
              </button>
              <button
                className="btn btn-sm rounded-xl flex-1 sm:flex-none bg-error/10 text-error border border-error/30 hover:bg-error hover:text-white transition-all gap-1"
                disabled={!!actionLoading}
                onClick={() => handleReview("rejected", req._id)}
              >
                {actionLoading === req._id + "rejected" ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <span className="loading loading-spinner loading-lg text-primary" />
  </div>
);

const ErrorAlert = ({ message }) => (
  <div className="flex items-center justify-center py-20 px-4">
    <div className="alert alert-error max-w-md rounded-2xl"><span>{message}</span></div>
  </div>
);

// ── Main Page ───────────────────────────────────────────────────
const Connections = () => {
  const [activeTab, setActiveTab] = useState("connections");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Connections</h1>

      {/* Pill tabs */}
      <div className="flex gap-2 mb-6 bg-base-300 p-1 rounded-2xl w-fit border border-base-content/10">
        {[
          { id: "connections", label: "My Connections" },
          { id: "pending", label: "Pending Requests" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/60 hover:text-base-content"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "connections" ? <MyConnections /> : <PendingRequests />}
    </div>
  );
};

export default Connections;
