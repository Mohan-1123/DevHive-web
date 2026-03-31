import { useEffect, useRef, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
const SWIPE_THRESHOLD = 100;

const Discover = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [page, setPage] = useState(1);
  const [noMore, setNoMore] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  const fetchFeed = async (pageNum) => {
    try {
      const res = await axios.get(BASE_URL + `/api/user/feed?page=${pageNum}&limit=10`, { withCredentials: true });
      const users = res.data.data.users || [];
      if (users.length === 0) {
        setNoMore(true);
      } else {
        setFeed((prev) => [...prev, ...users]);
        setPage(pageNum);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load feed.");
    }
  };

  useEffect(() => {
    fetchFeed(1).finally(() => setLoading(false));
  }, []);

  const handleAction = async (status, userId) => {
    if (actionLoading) return;
    setActionLoading(status);
    setActionError("");
    setDragX(0);
    try {
      await axios.post(BASE_URL + `/api/request/send/${status}/${userId}`, {}, { withCredentials: true });
      const remaining = feed.slice(1);
      setFeed(remaining);
      if (remaining.length === 0 && !noMore) {
        setPageLoading(true);
        await fetchFeed(page + 1);
        setPageLoading(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Action failed.";
      setActionError(`${err.response?.status ? `[${err.response.status}] ` : ""}${msg}`);
    } finally {
      setActionLoading("");
    }
  };

  const onPointerDown = (e) => {
    if (actionLoading) return;
    if (e.target.closest("button")) return;
    dragStart.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging || dragStart.current === null) return;
    setDragX(e.clientX - dragStart.current);
  };

  const onPointerUp = () => {
    if (!dragging || dragStart.current === null) return;
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD) handleAction("interested", feed[0]._id);
    else if (dragX < -SWIPE_THRESHOLD) handleAction("ignored", feed[0]._id);
    else setDragX(0);
    dragStart.current = null;
  };

  const rotation = dragX / 20;
  const swipeRight = dragX > SWIPE_THRESHOLD / 2;
  const swipeLeft = dragX < -SWIPE_THRESHOLD / 2;
  const swipeOpacity = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);

  if (loading) return <Spinner />;
  if (error) return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="alert alert-error max-w-md rounded-2xl"><span>{error}</span></div>
    </div>
  );
  if (pageLoading) return <Spinner />;
  if (feed.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5 px-4">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold">You&apos;re all caught up!</h2>
        <p className="text-base-content/60 mt-2">No more developers to discover. Check back later!</p>
      </div>
    </div>
  );

  const current = feed[0];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8 gap-6">

      {/* Stack depth visual */}
      <div className="relative w-full max-w-sm">
        {feed[2] && (
          <div className="absolute inset-x-4 -top-3 h-full bg-base-300 rounded-3xl opacity-30 border border-base-content/10" />
        )}
        {feed[1] && (
          <div className="absolute inset-x-2 -top-1.5 h-full bg-base-300 rounded-3xl opacity-60 border border-base-content/10" />
        )}

        {/* Main card */}
        <div
          className="relative bg-base-300 rounded-3xl overflow-hidden shadow-2xl shadow-black/20 select-none cursor-grab active:cursor-grabbing border border-base-content/10 z-10"
          style={{
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            transition: dragging ? "none" : "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* LIKE overlay */}
          <div
            className="absolute top-8 left-6 z-20 border-4 border-success rounded-2xl px-4 py-1.5 rotate-[-22deg] pointer-events-none"
            style={{ opacity: swipeRight ? swipeOpacity : 0, transition: "opacity 0.1s" }}
          >
            <span className="text-success font-black text-2xl tracking-widest">LIKE</span>
          </div>

          {/* NOPE overlay */}
          <div
            className="absolute top-8 right-6 z-20 border-4 border-error rounded-2xl px-4 py-1.5 rotate-22 pointer-events-none"
            style={{ opacity: swipeLeft ? swipeOpacity : 0, transition: "opacity 0.1s" }}
          >
            <span className="text-error font-black text-2xl tracking-widest">NOPE</span>
          </div>

          {/* Photo */}
          <div className="relative pointer-events-none h-80">
            <img
              src={current.photoUrl || fallbackPhoto}
              alt={`${current.firstName}'s photo`}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = fallbackPhoto; }}
              draggable={false}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            {/* Name on photo */}
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4">
              <h2 className="text-white text-2xl font-bold leading-tight">
                {current.firstName} {current.lastName}
                {current.age && <span className="font-light text-xl">, {current.age}</span>}
              </h2>
              {current.gender && (
                <p className="text-white/70 text-sm capitalize mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                  {current.gender}
                </p>
              )}
            </div>
          </div>

          {/* Card body */}
          <div className="px-5 pt-4 pb-5">
            {current.about && (
              <p className="text-base-content/80 text-sm leading-relaxed line-clamp-2 mb-3">{current.about}</p>
            )}

            {current.skills?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {current.skills.map((skill) => (
                  <span key={skill} className="badge badge-primary badge-outline badge-sm rounded-full">{skill}</span>
                ))}
              </div>
            )}

            {actionError && (
              <div className="alert alert-error py-2 text-xs rounded-xl mb-3">{actionError}</div>
            )}

            <p className="text-base-content/30 text-xs text-center mb-3">
              {feed.length} developer{feed.length !== 1 ? "s" : ""} left • Swipe or use buttons
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-6">
        {/* Skip */}
        <button
          className="w-16 h-16 rounded-full bg-base-300 border-2 border-error/30 text-error flex items-center justify-center shadow-lg hover:scale-110 hover:border-error/60 transition-all duration-200 disabled:opacity-40"
          disabled={!!actionLoading}
          onClick={() => handleAction("ignored", current._id)}
        >
          {actionLoading === "ignored" ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>

        {/* Like */}
        <button
          className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-secondary text-primary-content flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-110 hover:shadow-primary/50 transition-all duration-200 disabled:opacity-40"
          disabled={!!actionLoading}
          onClick={() => handleAction("interested", current._id)}
        >
          {actionLoading === "interested" ? (
            <span className="loading loading-spinner loading-md" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          )}
        </button>
      </div>

    </div>
  );
};

const Spinner = () => (
  <div className="flex items-center justify-center min-h-[80vh]">
    <span className="loading loading-spinner loading-lg text-primary"></span>
  </div>
);

export default Discover;
