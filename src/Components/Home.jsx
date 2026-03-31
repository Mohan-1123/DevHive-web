import { Link } from "react-router-dom";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Discover Developers",
    desc: "Browse developer profiles, filter by skills, and swipe through talent from around the world.",
    color: "text-primary bg-primary/10",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Build Connections",
    desc: "Send interest requests and grow a network of developers who share your passion and stack.",
    color: "text-secondary bg-secondary/10",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Chat & Collaborate",
    desc: "Message your matches in real-time. Build projects, share ideas, and grow your career together.",
    color: "text-accent bg-accent/10",
  },
];

const steps = [
  { num: "01", title: "Create your profile", desc: "Add your skills, bio, and photo to stand out." },
  { num: "02", title: "Discover & swipe", desc: "Swipe through developer profiles. Like the ones that interest you." },
  { num: "03", title: "Match & chat", desc: "When both developers like each other, it's a match — start chatting!" },
];

const Home = () => {
  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-[calc(100vh-64px)] px-4 gap-8 overflow-hidden">
        {/* Gradient background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          The developer network is live
        </div>

        <div className="flex flex-col gap-4 max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight">
            Find your next{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-secondary to-accent">
              dev partner
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-base-content/60 max-w-xl mx-auto leading-relaxed">
            devHive is where developers discover each other — swipe, connect, and build together.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/signup" className="btn btn-primary btn-lg rounded-2xl px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
            Get Started — it's free
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg rounded-2xl px-8 hover:-translate-y-0.5 transition-all">
            Login
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-3 text-sm text-base-content/50">
          <div className="flex -space-x-2">
            {["photo-1534528741775-53994a69daeb", "photo-1580489944761-15a19d654956", "photo-1492562080023-ab3db95bfbce"].map((id) => (
              <img
                key={id}
                src={`https://img.daisyui.com/images/stock/${id}.webp`}
                className="w-8 h-8 rounded-full ring-2 ring-base-100 object-cover"
                alt=""
              />
            ))}
          </div>
          <span>Join thousands of developers already on devHive</span>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 bg-base-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Everything you need to connect</h2>
            <p className="text-base-content/60 text-lg max-w-xl mx-auto">Built specifically for developers who want to build meaningful professional relationships.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="card bg-base-300 border border-base-content/10 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default"
              >
                <div className="card-body gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${f.color}`}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                    <p className="text-base-content/60 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">How devHive works</h2>
            <p className="text-base-content/60 text-lg">Three simple steps to your next collaboration</p>
          </div>
          <div className="flex flex-col gap-0">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-primary font-black text-sm">{step.num}</span>
                  </div>
                  {i < steps.length - 1 && <div className="w-0.5 h-12 bg-primary/20 mt-1" />}
                </div>
                <div className="pb-10">
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <p className="text-base-content/60 text-sm mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto bg-linear-to-br from-primary to-secondary rounded-3xl p-10 text-center text-primary-content shadow-2xl shadow-primary/20">
          <h2 className="text-3xl sm:text-4xl font-black mb-3">Ready to find your people?</h2>
          <p className="text-primary-content/80 text-lg mb-6">Create a free account and start discovering developers today.</p>
          <Link
            to="/signup"
            className="btn bg-white text-primary border-0 btn-lg rounded-2xl px-10 hover:bg-white/90 hover:-translate-y-0.5 transition-all font-bold shadow-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
