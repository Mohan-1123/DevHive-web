import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { addUser } from "../utils/userSlice";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const freeFeatures = [
  { label: "10 swipes per day", included: true },
  { label: "Up to 10 connections", included: true },
  { label: "Chat with matches", included: true },
  { label: "Premium 👑 badge", included: false },
  { label: "See who liked you", included: false },
  { label: "Unlimited swipes", included: false },
];

const goldFeatures = [
  { label: "Unlimited swipes", included: true },
  { label: "Unlimited connections", included: true },
  { label: "Chat with all matches", included: true },
  { label: "Premium 👑 badge on profile", included: true },
  { label: "See who liked you", included: true },
  { label: "Priority matching", included: true },
];

const comparisonRows = [
  { feature: "Daily swipes", free: "10 / day", gold: "Unlimited" },
  { feature: "Max connections", free: "10", gold: "Unlimited" },
  { feature: "Chat", free: "✓", gold: "✓" },
  { feature: "Premium badge", free: "—", gold: "👑" },
  { feature: "See who liked you", free: "—", gold: "✓" },
  { feature: "Priority matching", free: "—", gold: "✓" },
  { feature: "Price", free: "Free", gold: "₹999 lifetime" },
];

const Premium = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isPremium = user?.isPremium;

  const handleSubscribe = async () => {
    setError("");
    setLoading(true);

    if (!window.Razorpay) {
      setError("Payment gateway not available. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        BASE_URL + "/api/payment/order",
        {},
        { withCredentials: true }
      );

      const { orderId, amount, currency, key_id } = res.data;

      const options = {
        key: key_id,
        amount,
        currency,
        name: "devHive",
        description: "Gold Plan — Lifetime Membership",
        order_id: orderId,
        handler: async () => {
          try {
            const verifyRes = await axios.get(
              BASE_URL + "/api/payment/verify",
              { withCredentials: true }
            );
            dispatch(addUser({ ...user, isPremium: verifyRes.data.isPremium }));
            setSuccess(true);
            setTimeout(() => navigate("/discover"), 2000);
          } catch {
            setError("Payment verification failed. Please contact support@devhive.app.");
          }
        },
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.emailId || "",
        },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
    {/* Success overlay — outside all wrappers so it covers full screen on mobile too */}
    {success && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-base-100/90 backdrop-blur-md">
        <div className="flex flex-col items-center text-center px-8 py-12 bg-base-200 rounded-3xl border border-base-content/10 shadow-2xl max-w-sm w-full mx-4">
          <div className="text-6xl mb-4 animate-bounce">👑</div>
          <h2 className="text-3xl font-black mb-2">You're Gold!</h2>
          <p className="text-base-content/60 mb-1">Welcome to devHive Gold.</p>
          <p className="text-base-content/40 text-sm mb-6">Thank you for your support ❤️</p>
          <div className="w-full bg-base-300 rounded-full h-1.5 overflow-hidden mb-4">
            <div className="h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full animate-pulse w-full" />
          </div>
          <p className="text-xs text-base-content/40">Redirecting to Discover...</p>
        </div>
      </div>
    )}
    <div className="min-h-screen bg-base-100 pb-24 sm:pb-0">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-linear-to-br from-amber-500/10 via-base-200 to-orange-500/10 border-b border-base-content/10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-14 sm:py-20 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="text-4xl">👑</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Upgrade to{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-amber-500 to-orange-500">
              Gold
            </span>
          </h1>
          <p className="text-base-content/60 text-lg max-w-lg mx-auto">
            Unlock unlimited swipes, see who liked you, and stand out with a premium badge.
          </p>

          {isPremium && (
            <div className="inline-flex items-center gap-2 mt-6 bg-amber-500/10 border border-amber-500/30 text-amber-600 px-5 py-2.5 rounded-full text-sm font-semibold">
              👑 You're on Gold Plan · Thank you for supporting devHive!
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Error banner */}
        {error && (
          <div className="alert alert-error rounded-2xl mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── Plan Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">

          {/* Free Plan */}
          <div className="bg-base-300 rounded-3xl border border-base-content/10 p-7 flex flex-col">
            <div className="mb-5">
              <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">Current Plan</span>
              <h2 className="text-2xl font-bold mt-1">Free</h2>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black">₹0</span>
                <span className="text-base-content/50 text-sm">/ forever</span>
              </div>
            </div>
            <ul className="flex flex-col gap-3 flex-1 mb-6">
              {freeFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-sm">
                  {f.included ? (
                    <span className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-base-content/8 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  )}
                  <span className={f.included ? "text-base-content" : "text-base-content/40"}>{f.label}</span>
                </li>
              ))}
            </ul>
            <div className="btn btn-disabled w-full rounded-2xl cursor-not-allowed opacity-50">
              {isPremium ? "Previous Plan" : "Current Plan"}
            </div>
          </div>

          {/* Gold Plan */}
          <div className="relative bg-linear-to-br from-amber-500/10 to-orange-500/10 rounded-3xl border-2 border-amber-400/40 p-7 flex flex-col shadow-xl shadow-amber-500/10">
            {/* Recommended badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-linear-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                ⭐ RECOMMENDED
              </span>
            </div>

            <div className="mb-5 mt-2">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Premium</span>
              <h2 className="text-2xl font-bold mt-1 flex items-center gap-2">
                Gold <span className="text-xl">👑</span>
              </h2>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black">₹999</span>
                <span className="text-base-content/50 text-sm">/ lifetime</span>
              </div>
            </div>

            <ul className="flex flex-col gap-3 flex-1 mb-6">
              {goldFeatures.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-sm">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="font-medium">{f.label}</span>
                </li>
              ))}
            </ul>

            {isPremium ? (
              <button disabled className="btn w-full rounded-2xl border-0 bg-amber-500/20 text-amber-700 cursor-not-allowed">
                ✓ Current Plan
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="btn w-full rounded-2xl border-0 text-white bg-linear-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all font-bold"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>⚡ Get Gold — ₹999 Lifetime</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Comparison Table ── */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-center mb-6">Compare plans</h2>
          <div className="overflow-x-auto rounded-2xl border border-base-content/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-base-300">
                  <th className="text-left px-5 py-4 font-semibold text-base-content/60 w-1/2">Feature</th>
                  <th className="px-5 py-4 font-semibold text-center">Free</th>
                  <th className="px-5 py-4 font-bold text-center text-amber-600">Gold 👑</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={`border-t border-base-content/8 ${i % 2 === 0 ? "bg-base-100" : "bg-base-200/50"}`}>
                    <td className="px-5 py-3.5 font-medium">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center text-base-content/60">{row.free}</td>
                    <td className="px-5 py-3.5 text-center font-semibold text-amber-600">{row.gold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Trust signals ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { icon: "🔒", title: "Secure Payment", desc: "Powered by Razorpay — bank-grade security" },
            { icon: "♾️", title: "Lifetime Access", desc: "Pay once, enjoy forever — no renewals" },
            { icon: "💬", title: "Support", desc: "Email us at support@devhive.app" },
          ].map((t) => (
            <div key={t.title} className="bg-base-200 rounded-2xl p-5 border border-base-content/10">
              <div className="text-2xl mb-2">{t.icon}</div>
              <p className="font-semibold text-sm">{t.title}</p>
              <p className="text-xs text-base-content/50 mt-0.5">{t.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
    </>
  );
};

export default Premium;
