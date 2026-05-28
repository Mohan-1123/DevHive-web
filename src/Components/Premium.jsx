import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { addUser } from "../utils/userSlice";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ─── feature lists ─── */
const FREE_FEATURES = [
  { text: "10 swipes per day",    ok: true  },
  { text: "Up to 10 connections", ok: true  },
  { text: "Chat with matches",    ok: true  },
  { text: "See who liked you",    ok: false },
  { text: "Unlimited swipes",     ok: false },
  { text: "Gold 👑 badge",        ok: false },
];
const GOLD_FEATURES = [
  "Unlimited swipes every day",
  "Unlimited connections",
  "See who liked you",
  "Gold 👑 badge on profile",
  "Priority in discovery feed",
  "Chat with all matches",
];
const COMPARE = [
  { feature: "Daily swipes",      free: "10 / day", gold: "Unlimited" },
  { feature: "Connections",       free: "10",       gold: "Unlimited"  },
  { feature: "Chat",              free: true,       gold: true         },
  { feature: "See who liked you", free: false,      gold: true         },
  { feature: "Gold badge",        free: false,      gold: true         },
  { feature: "Priority matching", free: false,      gold: true         },
];

/* ─── tiny SVGs ─── */
const Check = ({ cls = "h-3.5 w-3.5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M5 13l4 4L19 7"/>
  </svg>
);
const Cross = ({ cls = "h-3 w-3" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

/* ─── Success overlay ─── */
const SuccessOverlay = () => (
  <div className="fixed inset-0 z-9999 flex items-center justify-center bg-base-100/90 backdrop-blur-md">
    <div className="flex flex-col items-center text-center px-8 py-12 bg-base-200 rounded-3xl border border-amber-400/20 shadow-2xl shadow-amber-500/10 max-w-sm w-full mx-4 animate-[fadeUp_0.4s_ease]">
      <div className="text-6xl mb-5 animate-bounce">👑</div>
      <h2 className="text-3xl font-black mb-2 text-base-content">Welcome to Gold!</h2>
      <p className="text-base-content/50 text-sm leading-relaxed mb-6">
        Your premium features are now active.<br/>Thank you for supporting devHive ❤️
      </p>
      <div className="w-full h-1 bg-base-300 rounded-full overflow-hidden">
        <div className="h-full w-full rounded-full animate-pulse"
          style={{ background: "linear-gradient(90deg,#f59e0b,#f97316)" }}/>
      </div>
      <p className="text-xs text-base-content/30 mt-3">Redirecting to Discover…</p>
    </div>
  </div>
);

/* ════════════════════════════════════
   MAIN
════════════════════════════════════ */
const Premium = () => {
  const user     = useSelector(s => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [success,       setSuccess]       = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(!!window.Razorpay);
  const isPremium = user?.isPremium;

  /* Load Razorpay script dynamically — only on this page, only once */
  useEffect(() => {
    if (window.Razorpay) { setRazorpayReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload  = () => setRazorpayReady(true);
    script.onerror = () => setError("Failed to load payment gateway. Please refresh.");
    document.body.appendChild(script);
    return () => {
      /* Clean up script tag when user leaves the Premium page */
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const handleSubscribe = async () => {
    setError("");
    setLoading(true);
    if (!razorpayReady || !window.Razorpay) {
      setError("Payment gateway is still loading. Please wait a moment and try again.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(BASE_URL + "/payment/order", {}, { withCredentials: true });
      const { orderId, amount, currency, key_id } = res.data;

      const options = {
        key: key_id, amount, currency,
        name: "devHive",
        description: "Gold Plan — Lifetime Membership",
        order_id: orderId,
        handler: async () => {
          try {
            const v = await axios.get(BASE_URL + "/payment/verify", { withCredentials: true });
            dispatch(addUser({ ...user, isPremium: v.data.isPremium }));
            setSuccess(true);
            setTimeout(() => navigate("/discover"), 2200);
          } catch {
            setError("Payment verification failed. Contact support@devhive.app.");
          }
        },
        prefill: {
          name:  `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.emailId || "",
        },
        theme: { color: "#f59e0b" },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => { setError("Payment failed. Please try again."); setLoading(false); });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes goldGlow { 0%,100%{box-shadow:0 0 24px rgba(245,158,11,0.3)} 50%{box-shadow:0 0 44px rgba(245,158,11,0.55)} }
        .gold-glow { animation: goldGlow 2.8s ease-in-out infinite; }
      `}</style>

      {success && <SuccessOverlay/>}

      <div className="min-h-screen bg-base-100">

        {/* ══════════ HERO ══════════ */}
        <div className="relative overflow-hidden border-b border-base-content/8">
          {/* background */}
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(245,158,11,0.1) 0%,transparent 70%)" }}/>
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(249,115,22,0.08),transparent 70%)" }}/>

          <div className="relative max-w-3xl mx-auto px-5 py-16 sm:py-24 text-center">

            {/* crown */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 gold-glow"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 8px 32px rgba(245,158,11,0.4)" }}>
              <span className="text-2xl">👑</span>
            </div>

            {isPremium ? (
              <>
                <h1 className="text-4xl sm:text-5xl font-black text-base-content tracking-tight mb-3">
                  You&apos;re on <span style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Gold</span>
                </h1>
                <p className="text-base-content/50 text-base">All premium features are active on your account.</p>
                <div className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full border border-amber-400/30 bg-amber-400/8 text-amber-500 text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>
                  Gold Member — Active
                </div>
              </>
            ) : (
              <>
                {/* pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/8 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>
                  <span className="text-[11px] text-amber-500 font-bold tracking-widest uppercase">One-time · No subscription</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black text-base-content tracking-tight leading-tight mb-4">
                  Upgrade to<br/>
                  <span style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    devHive Gold
                  </span>
                </h1>
                <p className="text-base-content/50 text-base max-w-md mx-auto leading-relaxed">
                  Unlock unlimited swipes, see who liked you, and stand out with a premium badge — forever.
                </p>

                {/* price hero */}
                <div className="flex items-baseline justify-center gap-2 mt-7">
                  <span className="text-5xl font-black text-base-content">₹999</span>
                  <span className="text-base-content/40 text-base font-medium">one-time</span>
                </div>
                <p className="text-xs text-base-content/25 mt-1">No hidden fees. No renewal. Yours forever.</p>
              </>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16 flex flex-col gap-12">

          {/* ── error banner ── */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-error/25 bg-error/8 px-4 py-3.5 text-sm text-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="flex-1">{error}</span>
              <button onClick={() => setError("")} className="opacity-50 hover:opacity-100 transition-opacity shrink-0">
                <Cross cls="h-3.5 w-3.5"/>
              </button>
            </div>
          )}

          {/* ══════════ PLAN CARDS ══════════ */}
          {!isPremium && (
            <div className="grid sm:grid-cols-2 gap-5">

              {/* Free */}
              <div className="rounded-2xl border border-base-content/10 bg-base-200/40 p-6 flex flex-col">
                <div className="mb-5">
                  <p className="text-[11px] font-bold text-base-content/35 uppercase tracking-widest mb-1.5">Current plan</p>
                  <h2 className="text-xl font-black text-base-content">Free</h2>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-3xl font-black text-base-content">₹0</span>
                    <span className="text-base-content/35 text-xs">forever</span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                  {FREE_FEATURES.map(({ text, ok }) => (
                    <li key={text} className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ok ? "bg-success/12 text-success" : "bg-base-content/8 text-base-content/25"}`}>
                        {ok ? <Check cls="h-3 w-3"/> : <Cross cls="h-2.5 w-2.5"/>}
                      </span>
                      <span className={`text-sm ${ok ? "text-base-content/75" : "text-base-content/30 line-through"}`}>{text}</span>
                    </li>
                  ))}
                </ul>

                <div className="w-full py-2.5 rounded-xl border border-base-content/10 text-center text-sm font-semibold text-base-content/30 cursor-not-allowed select-none">
                  Current Plan
                </div>
              </div>

              {/* Gold */}
              <div className="relative rounded-2xl border-2 border-amber-400/40 p-6 flex flex-col overflow-hidden gold-glow"
                style={{ background: "linear-gradient(145deg,rgba(245,158,11,0.08) 0%,rgba(249,115,22,0.04) 100%)" }}>

                {/* recommended badge */}
                <div className="absolute top-0 right-0">
                  <div className="text-[10px] font-black text-white px-3 py-1.5 rounded-bl-xl tracking-wide"
                    style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                    BEST VALUE
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-[11px] font-bold text-amber-500/80 uppercase tracking-widest mb-1.5">Premium</p>
                  <h2 className="text-xl font-black text-base-content flex items-center gap-2">
                    Gold <span>👑</span>
                  </h2>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-3xl font-black text-base-content">₹999</span>
                    <span className="text-base-content/35 text-xs">one-time</span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                  {GOLD_FEATURES.map(text => (
                    <li key={text} className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 text-amber-500">
                        <Check cls="h-3 w-3"/>
                      </span>
                      <span className="text-sm font-medium text-base-content/85">{text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleSubscribe}
                  disabled={loading || !razorpayReady}
                  className="w-full py-3.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 6px 24px rgba(245,158,11,0.4)" }}
                >
                  {loading || !razorpayReady ? (
                    <span className="loading loading-spinner loading-sm"/>
                  ) : (
                    <>⚡ Get Gold — ₹999 Lifetime</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ══════════ COMPARISON TABLE ══════════ */}
          <div>
            <h2 className="text-lg font-black text-base-content mb-5 text-center">Compare plans</h2>
            <div className="rounded-2xl border border-base-content/10 overflow-hidden">
              {/* header */}
              <div className="grid grid-cols-3 bg-base-200/80 border-b border-base-content/8 px-5 py-3">
                <span className="text-xs font-bold text-base-content/35 uppercase tracking-widest">Feature</span>
                <span className="text-xs font-bold text-base-content/50 uppercase tracking-widest text-center">Free</span>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest text-center">Gold 👑</span>
              </div>

              {COMPARE.map(({ feature, free, gold }, i) => (
                <div key={feature}
                  className={`grid grid-cols-3 px-5 py-3.5 items-center ${i < COMPARE.length - 1 ? "border-b border-base-content/6" : ""} ${i % 2 === 0 ? "bg-base-100" : "bg-base-200/25"}`}>
                  <span className="text-sm font-medium text-base-content/75">{feature}</span>

                  {/* free cell */}
                  <div className="flex justify-center">
                    {typeof free === "boolean" ? (
                      free
                        ? <span className="w-5 h-5 rounded-full bg-success/12 flex items-center justify-center text-success"><Check cls="h-3 w-3"/></span>
                        : <span className="w-5 h-5 rounded-full bg-base-content/8 flex items-center justify-center text-base-content/20"><Cross cls="h-2.5 w-2.5"/></span>
                    ) : (
                      <span className="text-xs font-semibold text-base-content/40">{free}</span>
                    )}
                  </div>

                  {/* gold cell */}
                  <div className="flex justify-center">
                    {typeof gold === "boolean" ? (
                      gold
                        ? <span className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-500"><Check cls="h-3 w-3"/></span>
                        : <span className="w-5 h-5 rounded-full bg-base-content/8 flex items-center justify-center text-base-content/20"><Cross cls="h-2.5 w-2.5"/></span>
                    ) : (
                      <span className="text-xs font-bold text-amber-500">{gold}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ CTA (non-premium only) ══════════ */}
          {!isPremium && (
            <div
              className="rounded-2xl border border-amber-400/20 px-6 py-8 text-center"
              style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.06),rgba(249,115,22,0.04))" }}
            >
              <p className="text-2xl font-black text-base-content mb-1">Ready to unlock everything?</p>
              <p className="text-base-content/40 text-sm mb-6">One payment, lifetime access. No subscriptions, no surprises.</p>
              <button
                onClick={handleSubscribe}
                disabled={loading || !razorpayReady}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 6px 24px rgba(245,158,11,0.4)" }}
              >
                {loading || !razorpayReady ? <span className="loading loading-spinner loading-sm"/> : <>⚡ Get Gold — ₹999 Lifetime</>}
              </button>
            </div>
          )}

          {/* ══════════ TRUST SIGNALS ══════════ */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "🔒", title: "Secure payment",   desc: "Powered by Razorpay" },
              { icon: "♾️", title: "Lifetime access",  desc: "Pay once, keep forever" },
              { icon: "💬", title: "Support",           desc: "support@devhive.app"   },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-1.5 p-4 rounded-2xl bg-base-200/40 border border-base-content/8">
                <span className="text-2xl">{icon}</span>
                <p className="text-xs font-bold text-base-content">{title}</p>
                <p className="text-[11px] text-base-content/35">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default Premium;
