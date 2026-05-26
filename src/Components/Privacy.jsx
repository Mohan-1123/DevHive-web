import { Link } from "react-router-dom";

/* ─── only 4 essential sections ─── */
const SECTIONS = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
    title: "What We Collect",
    color: "from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400",
    items: [
      "Name, email, age & gender — provided at signup.",
      "Profile photo, bio & skills — added by you.",
      "Swipe activity & chat messages between matches.",
      "Auth cookie & basic technical info (browser, IP).",
    ],
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    title: "How We Use It",
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
    items: [
      "Show your profile to other developers for discovery.",
      "Enable real-time chat between mutual connections.",
      "Process premium payments via Razorpay.",
      "Keep the platform secure and fix bugs.",
    ],
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    title: "Security & Sharing",
    color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    items: [
      "All data is transmitted over HTTPS — always encrypted.",
      "Passwords are hashed with bcrypt, never stored in plain text.",
      "We never sell or share your data with third parties.",
      "Data shared only if required by Indian law or court order.",
    ],
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
    title: "Your Rights",
    color: "from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400",
    items: [
      "View & edit your data anytime from your Profile page.",
      "Delete your account — removes all personal data permanently.",
      "Email us to request a full data export or manual deletion.",
      "devHive is for users aged 18+ only.",
    ],
  },
];

const Privacy = () => (
  <div className="min-h-screen bg-base-100">

    {/* ── HERO ── */}
    <div
      className="relative overflow-hidden border-b border-base-content/8"
      style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.08) 0%,transparent 50%,rgba(236,72,153,0.06) 100%)" }}
    >
      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }}/>

      <div className="relative max-w-3xl mx-auto px-5 py-14 sm:py-20">

        {/* breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="text-xs text-base-content/35 hover:text-primary transition-colors font-medium">devHive</Link>
          <span className="text-base-content/20 text-xs">/</span>
          <span className="text-xs text-base-content/55 font-medium">Privacy Policy</span>
        </div>

        {/* badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"/>
          <span className="text-[11px] text-primary font-semibold tracking-wide uppercase">Updated April 2026</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-base-content tracking-tight leading-tight mb-4">
          Privacy<br/>
          <span style={{ background: "linear-gradient(135deg,#818cf8,#c084fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Policy
          </span>
        </h1>

        <p className="text-base-content/50 text-base leading-relaxed max-w-xl">
          Simple and transparent. Here's exactly what data devHive collects,
          why we need it, and how we keep it safe.
        </p>
      </div>
    </div>

    {/* ── CONTENT ── */}
    <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">

      {/* 4-card grid */}
      <div className="grid sm:grid-cols-2 gap-5 mb-14">
        {SECTIONS.map(({ icon, title, color, items }) => (
          <div
            key={title}
            className={`rounded-2xl border bg-linear-to-br p-5 ${color}`}
          >
            {/* header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${color} border flex items-center justify-center shrink-0`}>
                {icon}
              </div>
              <h2 className="font-bold text-base-content text-sm">{title}</h2>
            </div>

            {/* items */}
            <ul className="flex flex-col gap-2.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-base-content/65 leading-relaxed">
                  <span className="w-1 h-1 rounded-full bg-current mt-1.5 shrink-0 opacity-60"/>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── CONTACT CARD ── */}
      <div
        className="rounded-2xl border border-base-content/10 overflow-hidden"
        style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.05),rgba(139,92,246,0.05))" }}
      >
        <div className="px-6 py-5 border-b border-base-content/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-base-content text-sm">Questions or Requests?</h2>
              <p className="text-xs text-base-content/40 mt-0.5">We respond within 2 business days</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-base-content/35 text-xs w-20 shrink-0">Email</span>
              <a href="mailto:support@devhive.app"
                className="text-primary font-semibold text-xs hover:underline underline-offset-2 transition-colors">
                support@devhive.app
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-base-content/35 text-xs w-20 shrink-0">Company</span>
              <span className="text-base-content/65 text-xs">DevHive Technologies, India</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-base-content/35 text-xs w-20 shrink-0">Governed by</span>
              <span className="text-base-content/65 text-xs">IT Act 2000 · SPDI Rules 2011</span>
            </div>
          </div>

          <a
            href="mailto:support@devhive.app"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95 shrink-0 self-start sm:self-auto"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Contact Us
          </a>
        </div>
      </div>

      {/* ── FOOTER ROW ── */}
      <div className="mt-10 pt-6 border-t border-base-content/8 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-base-content/35 hover:text-primary transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
          Back to devHive
        </Link>
        <span className="text-[11px] text-base-content/25">© 2026 DevHive Technologies</span>
      </div>

    </div>
  </div>
);

export default Privacy;
