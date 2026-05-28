import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

const BASE_URL        = import.meta.env.VITE_API_BASE_URL;
const FALLBACK_PHOTO  = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
const SWIPE_THRESHOLD = 90;

/* ─── skill colour palette (cycles) ─── */
const SKILL_COLORS = [
  "bg-violet-500/15 text-violet-400 border-violet-500/25",
  "bg-blue-500/15 text-blue-400 border-blue-500/25",
  "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  "bg-amber-500/15 text-amber-400 border-amber-500/25",
  "bg-rose-500/15 text-rose-400 border-rose-500/25",
  "bg-pink-500/15 text-pink-400 border-pink-500/25",
  "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
];

/* ─── gender colour dot ─── */
const GENDER_DOT = { male: "bg-blue-400", female: "bg-pink-400", other: "bg-purple-400" };

/* ─── SVGs ─── */
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const SpinnerIcon = ({ size = "md" }) => (
  <span className={`loading loading-spinner loading-${size} text-primary`}/>
);
const ReloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
  </svg>
);

/* ─── Toast ─── */
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 2800); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "like"
    ? "from-violet-600 to-pink-600"
    : type === "skip"
    ? "from-slate-600 to-slate-700"
    : "from-red-600 to-rose-700";
  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r ${bg} text-white text-sm font-semibold shadow-2xl animate-[toastPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]`}>
      {type === "like" && <HeartIcon/>}
      {type === "skip" && <XIcon/>}
      <span>{msg}</span>
    </div>
  );
};


/* ─── Empty state ─── */
const EmptyState = ({ onRefresh }) => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] overflow-hidden gap-6 px-4 text-center">
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-inner"
      style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(236,72,153,0.15))", border: "2px dashed rgba(99,102,241,0.3)" }}
    >🎉</div>
    <div>
      <h2 className="text-2xl font-black text-base-content">You&apos;re all caught up!</h2>
      <p className="text-base-content/45 mt-2 text-sm max-w-xs leading-relaxed">
        You&apos;ve seen all developers for now. New profiles appear every day — check back soon!
      </p>
    </div>
    <button
      onClick={onRefresh}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 18px rgba(99,102,241,0.4)" }}
    >
      <ReloadIcon/> Refresh
    </button>
  </div>
);

/* ─── Loading skeleton ─── */
const Skeleton = () => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] overflow-hidden px-4 gap-5">
    <div className="w-full max-w-85 rounded-3xl overflow-hidden animate-pulse">
      <div className="h-85 bg-base-300"/>
      <div className="bg-base-200 px-5 py-4 space-y-3">
        <div className="h-5 bg-base-300 rounded-full w-3/5"/>
        <div className="h-3.5 bg-base-300 rounded-full w-1/3"/>
        <div className="flex gap-2 pt-1">
          {[1,2,3].map(i => <div key={i} className="h-6 w-16 bg-base-300 rounded-full"/>)}
        </div>
      </div>
    </div>
    <div className="flex gap-5">
      <div className="w-14 h-14 rounded-full bg-base-300 animate-pulse"/>
      <div className="w-14 h-14 rounded-full bg-base-300 animate-pulse"/>
      <div className="w-16 h-16 rounded-full bg-base-300 animate-pulse"/>
    </div>
  </div>
);

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
const Discover = () => {
  const [feed,          setFeed]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [page,          setPage]          = useState(1);
  const [noMore,        setNoMore]        = useState(false);
  const [pageLoading,   setPageLoading]   = useState(false);
  const [toast,         setToast]         = useState(null);
  const [showAbout,     setShowAbout]     = useState(false);  // flip card

  /* drag state */
  const [dragX,    setDragX]    = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart  = useRef(null);
  const cardRef    = useRef(null);

  /* ── fetch ── */
  const fetchFeed = useCallback(async (pageNum) => {
    try {
      const res   = await axios.get(BASE_URL + `/user/feed?page=${pageNum}&limit=10`, { withCredentials: true });
      const users = res.data.data?.users || [];
      if (users.length === 0) {
        setNoMore(true);
      } else {
        setFeed(prev => pageNum === 1 ? users : [...prev, ...users]);
        setPage(pageNum);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load feed.");
    }
  }, []);

  useEffect(() => {
    fetchFeed(1).finally(() => setLoading(false));
  }, [fetchFeed]);

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    const onKey = (e) => {
      if (!feed.length || actionLoading) return;
      if (e.key === "ArrowLeft"  || e.key === "a") handleAction("ignored",    feed[0]._id);
      if (e.key === "ArrowRight" || e.key === "d") handleAction("interested", feed[0]._id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feed, actionLoading]);

  /* ── action ── */
  const handleAction = async (status, userId) => {
    if (actionLoading) return;
    setActionLoading(status);
    setDragX(0);
    setShowAbout(false);
    const isLike = status === "interested";

    /* animate card out */
    if (cardRef.current) {
      const dir = isLike ? 1 : -1;
      cardRef.current.style.transition = "transform 0.38s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.38s ease";
      cardRef.current.style.transform  = `translateX(${dir * 600}px) rotate(${dir * 25}deg)`;
      cardRef.current.style.opacity    = "0";
    }

    setToast({ type: isLike ? "like" : "skip", msg: isLike ? `Liked ${feed[0].firstName}!` : "Skipped" });

    await new Promise(r => setTimeout(r, 260));

    try {
      await axios.post(BASE_URL + `/request/send/${status}/${userId}`, {}, { withCredentials: true });
      const remaining = feed.slice(1);
      setFeed(remaining);
      if (remaining.length === 0 && !noMore) {
        setPageLoading(true);
        await fetchFeed(page + 1);
        setPageLoading(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Action failed.";
      setToast({ type: "error", msg });
      setFeed(f => f); // keep feed
    } finally {
      setActionLoading("");
      if (cardRef.current) {
        cardRef.current.style.transition = "none";
        cardRef.current.style.transform  = "";
        cardRef.current.style.opacity    = "";
      }
    }
  };

  /* ── drag / swipe ── */
  const onPointerDown = (e) => {
    if (actionLoading || e.target.closest("button")) return;
    dragStart.current = e.clientX;
    setDragging(true);
    setShowAbout(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging || dragStart.current === null) return;
    setDragX(e.clientX - dragStart.current);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if      (dragX >  SWIPE_THRESHOLD) handleAction("interested", feed[0]._id);
    else if (dragX < -SWIPE_THRESHOLD) handleAction("ignored",    feed[0]._id);
    else setDragX(0);
    dragStart.current = null;
  };

  /* derived drag values */
  const rotation    = dragX / 18;
  const swipeRight  = dragX >  SWIPE_THRESHOLD / 2;
  const swipeLeft   = dragX < -SWIPE_THRESHOLD / 2;
  const swipeAlpha  = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);

  /* ── render states ── */
  if (loading)     return <Skeleton/>;
  if (error)       return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] overflow-hidden gap-4 px-4">
      <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error text-2xl">⚠️</div>
      <div className="text-center">
        <p className="font-bold text-base-content">{error}</p>
        <p className="text-sm text-base-content/40 mt-1">Check your connection and try again.</p>
      </div>
      <button onClick={() => { setError(""); setLoading(true); fetchFeed(1).finally(() => setLoading(false)); }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
        <ReloadIcon/> Retry
      </button>
    </div>
  );
  if (pageLoading) return <Skeleton/>;
  if (feed.length === 0) return <EmptyState onRefresh={() => { setNoMore(false); setLoading(true); fetchFeed(1).finally(() => setLoading(false)); }}/>;

  const current = feed[0];
  const genderKey = (current.gender || "").toLowerCase();

  return (
    <>
      <style>{`
        @keyframes toastPop { from{opacity:0;transform:translate(-50%,-10px) scale(0.9)} to{opacity:1;transform:translate(-50%,0) scale(1)} }
        @keyframes cardIn   { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .card-in { animation: cardIn 0.32s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>

      {toast && <Toast type={toast.type} msg={toast.msg} onClose={() => setToast(null)}/>}

      {/* ── EXACT-VIEWPORT CONTAINER — no scroll ── */}
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-base-100">

        {/* ── LEFT sidebar (xl+) ── */}
        <div className="hidden xl:flex flex-col items-center justify-center gap-4 px-6 w-56 shrink-0 overflow-hidden">

          {/* progress ring */}
          <div className="w-full flex flex-col items-center gap-2 p-4 rounded-2xl bg-base-200/50 border border-base-content/8">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-base-content/8"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#prog)" strokeWidth="2.5"
                strokeDasharray={`${Math.min(feed.length * 3, 100)} 100`} strokeLinecap="round"/>
              <defs>
                <linearGradient id="prog" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
              </defs>
            </svg>
            <p className="text-xl font-black text-base-content">{feed.length}</p>
            <p className="text-[11px] text-base-content/35 font-medium">developers left</p>
          </div>

        </div>

        {/* ── CENTER — card + buttons, strictly contained ── */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 overflow-hidden">

          {/* card stack wrapper — grows to fill but never overflows */}
          <div className="relative w-full max-w-sm shrink-0">

            {/* shadow cards */}
            {feed[2] && (
              <div className="absolute inset-x-5 -top-3 h-full rounded-3xl bg-base-300/50 border border-base-content/8 pointer-events-none"/>
            )}
            {feed[1] && (
              <div className="absolute inset-x-2.5 -top-1.5 h-full rounded-3xl bg-base-300/80 border border-base-content/8 pointer-events-none"/>
            )}

            {/* MAIN CARD */}
            <div
              ref={cardRef}
              key={current._id}
              className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/30 select-none cursor-grab active:cursor-grabbing border border-base-content/10 z-10 card-in"
              style={{
                transform:  `translateX(${dragX}px) rotate(${rotation}deg)`,
                transition: dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* LIKE stamp */}
              <div className="absolute top-6 left-5 z-30 pointer-events-none"
                style={{ opacity: swipeRight ? swipeAlpha : 0, transition: "opacity 0.08s" }}>
                <div className="border-[3px] border-emerald-400 rounded-xl px-3 py-1 -rotate-[20deg] bg-black/20 backdrop-blur-sm">
                  <span className="text-emerald-400 font-black text-lg tracking-[0.2em]">LIKE</span>
                </div>
              </div>

              {/* NOPE stamp */}
              <div className="absolute top-6 right-5 z-30 pointer-events-none"
                style={{ opacity: swipeLeft ? swipeAlpha : 0, transition: "opacity 0.08s" }}>
                <div className="border-[3px] border-rose-400 rounded-xl px-3 py-1 rotate-[20deg] bg-black/20 backdrop-blur-sm">
                  <span className="text-rose-400 font-black text-lg tracking-[0.2em]">NOPE</span>
                </div>
              </div>

              {/* ── PHOTO — responsive height via aspect ratio ── */}
              <div className="relative bg-base-300" style={{ aspectRatio: "3/3.6" }}>
                <img
                  src={current.photo || current.photoUrl || FALLBACK_PHOTO}
                  alt={current.firstName}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { e.target.src = FALLBACK_PHOTO; }}
                  draggable={false}
                />

                {/* gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"/>

                {/* feed count badge */}
                {feed.length > 1 && (
                  <div className="absolute top-3.5 right-3.5 bg-black/45 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10">
                    <span className="text-white/70 text-[11px] font-semibold">{feed.length} left</span>
                  </div>
                )}

                {/* info toggle */}
                <button
                  type="button"
                  onClick={() => setShowAbout(v => !v)}
                  className={`absolute bottom-3.5 right-3.5 z-20 w-8 h-8 rounded-full border backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 ${showAbout ? "bg-primary/80 border-primary text-white" : "bg-white/15 border-white/20 text-white/80 hover:bg-white/25"}`}
                >
                  <InfoIcon/>
                </button>

                {/* name + gender */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10">
                  <h2 className="text-white text-2xl font-black leading-tight tracking-tight drop-shadow">
                    {current.firstName} {current.lastName}
                    {current.age && <span className="font-light text-lg ml-1.5 text-white/75">{current.age}</span>}
                  </h2>
                  {current.gender && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${GENDER_DOT[genderKey] || "bg-purple-400"}`}/>
                      <span className="text-white/60 text-sm capitalize font-medium">{current.gender}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── ABOUT PANEL (slides in) ── */}
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: showAbout ? "180px" : "0px" }}
              >
                <div className="px-4 py-3 border-t border-base-content/8" style={{ background: "rgba(8,8,18,0.97)" }}>
                  <p className="text-white/60 text-xs leading-relaxed mb-2.5 line-clamp-2">
                    {current.about || <span className="italic text-white/25">No bio yet.</span>}
                  </p>
                  {current.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {current.skills.slice(0, 8).map((skill, i) => (
                        <span key={skill} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>{skill}</span>
                      ))}
                      {current.skills.length > 8 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-base-content/15 text-base-content/35">+{current.skills.length - 8}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── CARD FOOTER ── */}
              <div className="px-4 pt-2.5 pb-3 bg-base-200/70">
                {!showAbout && current.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {current.skills.slice(0, 4).map((skill, i) => (
                      <span key={skill} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>{skill}</span>
                    ))}
                    {current.skills.length > 4 && (
                      <button type="button" onClick={() => setShowAbout(true)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/25 text-primary/70 hover:text-primary transition-colors">
                        +{current.skills.length - 4} more
                      </button>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 text-[10px] text-base-content/20 font-medium">
                  <span className="text-rose-400/40">← Skip</span>
                  <span className="text-base-content/10">·</span>
                  <span>swipe or tap</span>
                  <span className="text-base-content/10">·</span>
                  <span className="text-emerald-400/40">Like →</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── ACTION BUTTONS ── */}
          <div className="flex items-center gap-6 shrink-0">

            {/* Skip / Pass */}
            <button
              disabled={!!actionLoading}
              onClick={() => handleAction("ignored", current._id)}
              className="group relative w-16 h-16 rounded-full bg-base-200 border-2 border-base-content/12 text-base-content/50 flex items-center justify-center shadow-lg hover:border-rose-500/60 hover:text-rose-400 hover:bg-rose-500/8 hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {actionLoading === "ignored" ? <SpinnerIcon size="sm"/> : <XIcon/>}
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-base-content/25 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Pass</span>
            </button>

            {/* Like / Connect */}
            <button
              disabled={!!actionLoading}
              onClick={() => handleAction("interested", current._id)}
              className="group relative w-16 h-16 rounded-full text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)", boxShadow: "0 6px 24px rgba(99,102,241,0.45)" }}
            >
              {actionLoading === "interested" ? <SpinnerIcon size="md"/> : <HeartIcon/>}
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-base-content/25 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Connect</span>
            </button>

          </div>

          {/* mobile count */}
          <p className="xl:hidden text-[11px] text-base-content/25 font-medium shrink-0">
            {feed.length} developer{feed.length !== 1 ? "s" : ""} left
          </p>

        </div>

        {/* ── RIGHT sidebar (xl+) ── */}
        <div className="hidden xl:flex flex-col items-center justify-center gap-4 px-6 w-56 shrink-0 overflow-hidden">

          {/* currently viewing */}
          <div className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-base-200/50 border border-base-content/8">
            <p className="text-[10px] font-bold text-base-content/35 uppercase tracking-widest">Viewing</p>
            <div className="flex items-center gap-3">
              <img
                src={current.photo || current.photoUrl || FALLBACK_PHOTO}
                alt={current.firstName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                onError={e => { e.target.src = FALLBACK_PHOTO; }}
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-base-content truncate">{current.firstName} {current.lastName}</p>
                <p className="text-xs text-base-content/35 capitalize">{current.gender}{current.age ? ` · ${current.age}` : ""}</p>
              </div>
            </div>
            {current.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {current.skills.slice(0, 4).map((s, i) => (
                  <span key={s} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* up next */}
          {feed[1] && (
            <div className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-base-200/50 border border-base-content/8 opacity-55">
              <p className="text-[10px] font-bold text-base-content/35 uppercase tracking-widest">Up Next</p>
              <div className="flex items-center gap-3">
                <img
                  src={feed[1].photo || feed[1].photoUrl || FALLBACK_PHOTO}
                  alt={feed[1].firstName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-base-content/10 blur-sm shrink-0"
                  onError={e => { e.target.src = FALLBACK_PHOTO; }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-base-content blur-sm select-none truncate">{feed[1].firstName} {feed[1].lastName}</p>
                  <p className="text-xs text-base-content/30">···</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </>
  );
};

export default Discover;
