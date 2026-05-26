import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

/* ── Icons ── */
const Icon = {
  arrow: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  search: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  users: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chat: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  check: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  lock: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  code: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  globe: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const features = [
  {
    icon: <Icon.search className="w-6 h-6" />,
    title: "Discover developers",
    desc: "Swipe through curated profiles filtered by stack, skills, and interests. Find your next collaborator in minutes.",
  },
  {
    icon: <Icon.users className="w-6 h-6" />,
    title: "Grow your network",
    desc: "Send connection requests and build a developer circle that actually helps — no noise, no recruiters.",
  },
  {
    icon: <Icon.chat className="w-6 h-6" />,
    title: "Chat in real-time",
    desc: "Match, message, and ship together. Built-in messaging keeps the conversation moving.",
  },
  {
    icon: <Icon.lock className="w-6 h-6" />,
    title: "Private by default",
    desc: "Your data is yours. No tracking, no selling profiles, no algorithm deciding your feed for you.",
  },
  {
    icon: <Icon.code className="w-6 h-6" />,
    title: "Built for engineers",
    desc: "Skills tags, tech stacks, project interests — every field exists because engineers actually need it.",
  },
  {
    icon: <Icon.globe className="w-6 h-6" />,
    title: "Worldwide community",
    desc: "Over 10,000 developers from 80+ countries. Find collaborators across time zones, not borders.",
  },
];

const steps = [
  { num: "01", title: "Create your profile", desc: "Add your skills, stack, and a short bio. Takes under 2 minutes." },
  { num: "02", title: "Discover & connect", desc: "Swipe through profiles. Send requests to developers you want to work with." },
  { num: "03", title: "Match & build", desc: "When a request is accepted, start chatting — and ship your next project together." },
];

const stats = [
  { value: "10,000+", label: "developers" },
  { value: "80+",     label: "countries" },
  { value: "50,000+", label: "connections" },
  { value: "4.9★",    label: "user rating" },
];

const Home = () => {
  const user = useSelector((s) => s.user);
  const primaryCta = user ? "/discover" : "/signup";
  const primaryLabel = user ? "Open Discover" : "Get started — it's free";

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes float  { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        .fade-up-1 { animation: fadeUp 0.6s ease 0.0s both }
        .fade-up-2 { animation: fadeUp 0.6s ease 0.08s both }
        .fade-up-3 { animation: fadeUp 0.6s ease 0.16s both }
        .fade-up-4 { animation: fadeUp 0.6s ease 0.24s both }
        .fade-up-5 { animation: fadeUp 0.6s ease 0.32s both }
        .float     { animation: float 6s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) {
          .fade-up-1,.fade-up-2,.fade-up-3,.fade-up-4,.fade-up-5,.float { animation: none !important }
        }
      `}</style>

      <div className="flex flex-col">

        {/* ══ HERO ══ */}
        <section className="relative flex flex-col items-center justify-center text-center px-5 py-20 sm:py-28 gap-7 overflow-hidden">
          {/* subtle dot grid */}
          <div
            className="absolute inset-0 -z-10 opacity-40"
            style={{ backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          {/* glow orbs */}
          <div className="absolute -z-10 top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)" }} />
          <div className="absolute -z-10 bottom-0 -right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.2), transparent 70%)" }} />

          <div className="fade-up-1 inline-flex items-center gap-2 bg-primary/8 text-primary text-xs font-semibold px-3.5 py-1.5 rounded-full border border-primary/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            The developer network is live
          </div>

          <h1 className="fade-up-2 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl leading-[1.05]">
            Find your next{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)" }}
            >
              dev partner
            </span>
          </h1>

          <p className="fade-up-3 text-base sm:text-lg text-base-content/55 max-w-xl leading-relaxed">
            devHive is where engineers discover each other — swipe, connect, and build together.
            No recruiters. No noise. Just developers.
          </p>

          <div className="fade-up-4 flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              to={primaryCta}
              className="group px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 10px 30px rgba(99,102,241,0.35)" }}
            >
              {primaryLabel}
              <Icon.arrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            {!user && (
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold border border-base-content/15 bg-base-200/50 hover:bg-base-200 hover:border-base-content/25 transition-all"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* social proof row */}
          <div className="fade-up-5 flex items-center gap-3 mt-4 text-xs sm:text-sm text-base-content/45">
            <div className="flex -space-x-2">
              {["Felix", "Aneka", "Mia", "Leo", "Sara"].map((seed) => (
                <img
                  key={seed}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                  className="w-7 h-7 rounded-full ring-2 ring-base-100 bg-base-300"
                  alt=""
                />
              ))}
            </div>
            <span>
              Joined by <span className="font-semibold text-base-content/70">10,000+</span> developers
            </span>
          </div>

          {/* stats strip */}
          <div className="fade-up-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-8 mt-8 pt-8 border-t border-base-content/8 w-full max-w-3xl">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg,#818cf8,#c084fc)" }}>
                  {s.value}
                </span>
                <span className="text-[10px] sm:text-xs text-base-content/45 uppercase tracking-widest mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section className="px-5 py-16 sm:py-24 bg-base-200/50 border-y border-base-content/8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Features</p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Built for how developers actually work</h2>
              <p className="text-base-content/50 text-sm sm:text-base max-w-xl mx-auto mt-3">
                Every feature designed around the thing engineers care about: finding the right people to build with.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group bg-base-300 border border-base-content/8 rounded-2xl p-5 hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.2)" }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
                  <p className="text-sm text-base-content/55 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section className="px-5 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">How it works</p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Three steps to your next collab</h2>
            </div>

            <div className="flex flex-col gap-2">
              {steps.map((step, i) => (
                <div key={step.num} className="relative flex gap-5 items-start">
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-black shrink-0"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}
                    >
                      {step.num}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 min-h-12 bg-linear-to-b from-primary/30 to-transparent mt-1" />
                    )}
                  </div>
                  <div className="pb-10 pt-1.5">
                    <h3 className="font-bold text-base sm:text-lg">{step.title}</h3>
                    <p className="text-sm text-base-content/55 mt-1 leading-relaxed max-w-md">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIAL ══ */}
        <section className="px-5 pb-16 sm:pb-24">
          <div className="max-w-2xl mx-auto bg-base-300 border border-base-content/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)" }} />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary/40 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.3 6.6C6.2 8.3 4 11.8 4 15c0 2.8 1.9 4.5 4 4.5 2 0 3.5-1.4 3.5-3.4 0-1.9-1.3-3.3-3-3.3-.4 0-.7.1-1 .2.4-1.8 2-3.5 4-4.7l-2.2-1.7zm9 0C15.2 8.3 13 11.8 13 15c0 2.8 1.9 4.5 4 4.5 2 0 3.5-1.4 3.5-3.4 0-1.9-1.3-3.3-3-3.3-.4 0-.7.1-1 .2.4-1.8 2-3.5 4-4.7l-2.2-1.7z" />
            </svg>
            <p className="text-base sm:text-lg text-base-content/80 leading-relaxed">
              I found my co-founder on devHive. We matched on a Tuesday, shipped our MVP by the end of the month.
              This is what a dev network should feel like.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" alt="" className="w-10 h-10 rounded-full bg-base-100" />
              <div>
                <p className="font-semibold text-sm">Priya Sharma</p>
                <p className="text-xs text-base-content/45">Full-stack engineer · Bangalore</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="px-5 pb-20 sm:pb-28">
          <div
            className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" }}
          >
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.3) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)" }} />

            <div className="relative">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
                Ready to find your people?
              </h2>
              <p className="text-white/55 text-sm sm:text-base mb-8 max-w-md mx-auto">
                Create a free account and start discovering developers who share your stack and ambition.
              </p>
              <Link
                to={primaryCta}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-white text-[#302b63] hover:-translate-y-0.5 transition-all shadow-xl"
              >
                {user ? "Open Discover" : "Create free account"}
                <Icon.arrow className="w-4 h-4" />
              </Link>
              <div className="flex items-center justify-center gap-5 mt-6 text-xs text-white/45">
                <span className="inline-flex items-center gap-1.5"><Icon.check className="w-3.5 h-3.5 text-green-400" /> Free forever</span>
                <span className="inline-flex items-center gap-1.5"><Icon.check className="w-3.5 h-3.5 text-green-400" /> No credit card</span>
                <span className="hidden sm:inline-flex items-center gap-1.5"><Icon.check className="w-3.5 h-3.5 text-green-400" /> 2-min setup</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;
