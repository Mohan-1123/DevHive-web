import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

const Avatar = ({ user }) => (
  <div className="avatar shrink-0">
    <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
      <img
        src={user.photoUrl || fallbackPhoto}
        alt={`${user.firstName}'s photo`}
        onError={(e) => { e.target.src = fallbackPhoto; }}
      />
    </div>
  </div>
);

const UserInfo = ({ user }) => (
  <div className="flex-1 min-w-0">
    <h2 className="font-bold text-lg truncate">{user.firstName} {user.lastName}</h2>
    <div className="flex flex-wrap gap-2 text-sm text-base-content/60">
      {user.age && <span>{user.age} yrs</span>}
      {user.age && user.gender && <span>·</span>}
      {user.gender && <span className="capitalize">{user.gender}</span>}
    </div>
    {user.about && (
      <p className="text-sm text-base-content/70 mt-1 line-clamp-2">{user.about}</p>
    )}
    {user.skills?.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-2">
        {user.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="badge badge-primary badge-outline badge-sm">{skill}</span>
        ))}
        {user.skills.length > 3 && (
          <span className="badge badge-ghost badge-sm">+{user.skills.length - 3}</span>
        )}
      </div>
    )}
  </div>
);

const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 px-4">
    <div className="text-6xl">{icon}</div>
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="text-base-content/60 text-center">{subtitle}</p>
  </div>
);

// ── My Connections Tab ──────────────────────────────────────────
const MyConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(BASE_URL + "/api/user/connections", { withCredentials: true })
      .then((res) => setConnections(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load connections."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorAlert message={error} />;
  if (connections.length === 0)
    return <EmptyState icon="🤝" title="No Connections Yet" subtitle="Start discovering developers and make your first connection!" />;

  return (
    <div className="flex flex-col gap-4">
      {connections.map((conn) => (
        <div key={conn._id} className="card bg-base-300 shadow-md">
          <div className="card-body p-4 flex flex-row items-center gap-4">
            <Avatar user={conn} />
            <UserInfo user={conn} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Pending / Received Tab ──────────────────────────────────────
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
      await axios.post(
        BASE_URL + `/api/request/review/${status}/${requestId}`,
        {},
        { withCredentials: true }
      );
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorAlert message={error} />;
  if (requests.length === 0)
    return <EmptyState icon="📭" title="No Pending Requests" subtitle="You have no connection requests at the moment." />;

  return (
    <div className="flex flex-col gap-4">
      {requests.map((req) => {
        const sender = req.fromUserId;
        return (
          <div key={req._id} className="card bg-base-300 shadow-md">
            <div className="card-body p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar user={sender} />
              <UserInfo user={sender} />
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <button
                  className="btn btn-primary btn-sm flex-1 sm:flex-none"
                  disabled={!!actionLoading}
                  onClick={() => handleReview("accepted", req._id)}
                >
                  {actionLoading === req._id + "accepted" ? <span className="loading loading-spinner loading-xs"></span> : "Accept"}
                </button>
                <button
                  className="btn btn-ghost btn-sm flex-1 sm:flex-none"
                  disabled={!!actionLoading}
                  onClick={() => handleReview("rejected", req._id)}
                >
                  {actionLoading === req._id + "rejected" ? <span className="loading loading-spinner loading-xs"></span> : "Reject"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Helpers ─────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <span className="loading loading-spinner loading-lg text-primary"></span>
  </div>
);

const ErrorAlert = ({ message }) => (
  <div className="flex items-center justify-center py-20 px-4">
    <div className="alert alert-error max-w-md"><span>{message}</span></div>
  </div>
);

// ── Main Page ────────────────────────────────────────────────────
const Connections = () => {
  const [activeTab, setActiveTab] = useState("connections");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Connections</h1>

      <div role="tablist" className="tabs tabs-bordered mb-6">
        <button
          role="tab"
          className={`tab ${activeTab === "connections" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("connections")}
        >
          My Connections
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "pending" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Requests
        </button>
      </div>

      {activeTab === "connections" ? <MyConnections /> : <PendingRequests />}
    </div>
  );
};

export default Connections;
