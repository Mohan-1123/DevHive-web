import { useEffect, useRef, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
const SWIPE_THRESHOLD = 100; // px needed to trigger a swipe

const Discover = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");       // load error — full page
  const [actionError, setActionError] = useState(""); // action error — inline
  const [actionLoading, setActionLoading] = useState("");
  const [page, setPage] = useState(1);
  const [noMore, setNoMore] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  // Swipe state
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
      await axios.post(
        BASE_URL + `/api/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
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

  // ── Pointer drag handlers ──────────────────────────────────────
  const onPointerDown = (e) => {
    if (actionLoading) return;
    if (e.target.closest("button")) return; // don't start drag on button clicks
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
    if (dragX > SWIPE_THRESHOLD) {
      handleAction("interested", feed[0]._id);
    } else if (dragX < -SWIPE_THRESHOLD) {
      handleAction("ignored", feed[0]._id);
    } else {
      setDragX(0);
    }
    dragStart.current = null;
  };

  // ── Derived swipe visuals ──────────────────────────────────────
  const rotation = dragX / 20;
  const swipeRight = dragX > SWIPE_THRESHOLD / 2;
  const swipeLeft = dragX < -SWIPE_THRESHOLD / 2;

  // ── Render states ──────────────────────────────────────────────
  if (loading) return <Spinner />;
  if (error) return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="alert alert-error max-w-md"><span>{error}</span></div>
    </div>
  );
  if (pageLoading) return <Spinner />;
  if (feed.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-4">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold">You&apos;re all caught up!</h2>
      <p className="text-base-content/60 text-center">No more developers to discover. Check back later!</p>
    </div>
  );

  const current = feed[0];

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div
        className="card bg-base-300 w-full max-w-sm shadow-xl select-none cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
          transition: dragging ? "none" : "transform 0.3s ease",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Swipe hint overlays */}
        {swipeRight && (
          <div className="absolute top-6 left-6 z-10 border-4 border-success rounded-lg px-3 py-1 rotate-[-20deg]">
            <span className="text-success font-extrabold text-2xl tracking-widest">LIKE</span>
          </div>
        )}
        {swipeLeft && (
          <div className="absolute top-6 right-6 z-10 border-4 border-error rounded-lg px-3 py-1 rotate-20">
            <span className="text-error font-extrabold text-2xl tracking-widest">SKIP</span>
          </div>
        )}

        {/* Photo */}
        <figure className="relative pointer-events-none">
          <img
            src={current.photoUrl || fallbackPhoto}
            alt={`${current.firstName}'s photo`}
            className="w-full h-72 object-cover"
            onError={(e) => { e.target.src = fallbackPhoto; }}
            draggable={false}
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
          {current.about && (
            <p className="text-base-content/80 text-sm line-clamp-3">{current.about}</p>
          )}
          {current.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {current.skills.map((skill) => (
                <span key={skill} className="badge badge-primary badge-outline badge-sm">{skill}</span>
              ))}
            </div>
          )}

          <p className="text-base-content/40 text-xs text-center mt-1">
            Swipe right to like · left to skip
          </p>

          <p className="text-base-content/40 text-xs text-right">
            {feed.length} developer{feed.length !== 1 ? "s" : ""} left
          </p>

          {/* Action Error */}
          {actionError && (
            <div className="alert alert-error py-2 text-sm">{actionError}</div>
          )}

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

const Spinner = () => (
  <div className="flex items-center justify-center min-h-[80vh]">
    <span className="loading loading-spinner loading-lg text-primary"></span>
  </div>
);

export default Discover;
