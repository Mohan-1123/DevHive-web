import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

const Discover = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    axios
      .get(BASE_URL + "/api/user/feed", { withCredentials: true })
      .then((res) => setFeed(res.data.data.users || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load feed."))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (status, userId) => {
    setActionLoading(status);
    try {
      await axios.post(
        BASE_URL + `/api/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
      setFeed((prev) => prev.slice(1));
    } catch (err) {
      setError(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading("");
    }
  };

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

  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold">You&apos;re all caught up!</h2>
        <p className="text-base-content/60 text-center">
          No more developers to discover. Check back later!
        </p>
      </div>
    );
  }

  const current = feed[0];

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="card bg-base-300 w-full max-w-sm shadow-xl">

        {/* Photo */}
        <figure className="relative">
          <img
            src={current.photoUrl || fallbackPhoto}
            alt={`${current.firstName}'s photo`}
            className="w-full h-72 object-cover"
            onError={(e) => { e.target.src = fallbackPhoto; }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent px-4 py-3">
            <h2 className="text-white text-xl font-bold">
              {current.firstName} {current.lastName}
              {current.age && <span className="font-normal text-base">, {current.age}</span>}
            </h2>
            {current.gender && (
              <p className="text-white/80 text-sm capitalize">{current.gender}</p>
            )}
          </div>
        </figure>

        <div className="card-body pt-4 pb-6 px-5">

          {/* About */}
          {current.about && (
            <p className="text-base-content/80 text-sm line-clamp-3">{current.about}</p>
          )}

          {/* Skills */}
          {current.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {current.skills.map((skill) => (
                <span key={skill} className="badge badge-primary badge-outline badge-sm">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Remaining count */}
          <p className="text-base-content/40 text-xs text-right mt-1">
            {feed.length} developer{feed.length !== 1 ? "s" : ""} left
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              className="btn btn-ghost flex-1 border border-base-content/20"
              disabled={!!actionLoading}
              onClick={() => handleAction("ignored", current._id)}
            >
              {actionLoading === "ignored"
                ? <span className="loading loading-spinner loading-sm"></span>
                : "👎 Skip"}
            </button>
            <button
              className="btn btn-primary flex-1"
              disabled={!!actionLoading}
              onClick={() => handleAction("interested", current._id)}
            >
              {actionLoading === "interested"
                ? <span className="loading loading-spinner loading-sm"></span>
                : "👍 Interested"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
