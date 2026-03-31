import { Link } from "react-router-dom";

const features = [
  {
    icon: "🔍",
    title: "Discover Developers",
    desc: "Browse through developer profiles, filter by skills, and find the right people to work with.",
  },
  {
    icon: "🤝",
    title: "Connect",
    desc: "Send interest requests and build mutual connections with developers who share your passion.",
  },
  {
    icon: "🚀",
    title: "Collaborate",
    desc: "Turn connections into collaborations — build projects, share ideas, and grow together.",
  },
];

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center min-h-[80vh] px-4 gap-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-primary">devHive</h1>
        <p className="text-lg sm:text-2xl text-base-content/70 max-w-xl">
          The network built for developers. Discover, connect, and collaborate with engineers around the world.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link to="/signup" className="btn btn-primary btn-lg px-8">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-ghost btn-lg px-8 border border-base-content/20">
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-base-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Why devHive?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="card bg-base-300 shadow-md text-center">
              <div className="card-body items-center gap-3">
                <div className="text-5xl">{f.icon}</div>
                <h3 className="card-title justify-center">{f.title}</h3>
                <p className="text-base-content/70 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="flex flex-col items-center justify-center py-16 px-4 gap-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Ready to find your people?</h2>
        <p className="text-base-content/60">Join thousands of developers already on devHive.</p>
        <Link to="/signup" className="btn btn-primary btn-lg px-10">
          Create Free Account
        </Link>
      </section>
    </div>
  );
};

export default Home;
