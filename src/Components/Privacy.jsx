import { Link } from "react-router-dom";

const sections = [
  {
    num: "01",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Information We Collect",
    items: [
      { label: "Account data", detail: "Name, email address, age, and gender provided during signup." },
      { label: "Profile data", detail: "Profile photo URL, about section, and skills you add to your profile." },
      { label: "Activity data", detail: "Swipe history — which profiles you liked or skipped." },
      { label: "Messages", detail: "Chat messages exchanged between matched users." },
      { label: "Payment data", detail: "Membership plan type and Razorpay transaction ID. We never store your card details — Razorpay handles all payment processing." },
      { label: "Technical data", detail: "IP address, browser type, device information, and authentication cookies." },
    ],
  },
  {
    num: "02",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "How We Use Your Information",
    items: [
      { detail: "Display your profile to other devHive users for discovery." },
      { detail: "Create mutual connections when two users both express interest." },
      { detail: "Enable real-time chat between matched users." },
      { detail: "Process premium subscription payments via Razorpay." },
      { detail: "Improve app performance, fix bugs, and enhance the user experience." },
      { detail: "Comply with applicable Indian laws and legal obligations." },
    ],
  },
  {
    num: "03",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    title: "Information Sharing",
    items: [
      { detail: "We never sell, rent, or trade your personal data to third parties." },
      { detail: "Your profile (name, photo, skills, about) is visible to other registered devHive users." },
      { detail: "Razorpay processes all payment transactions under their own privacy policy (razorpay.com/privacy)." },
      { detail: "We may disclose data if required by Indian law, court order, or government authority." },
    ],
  },
  {
    num: "04",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Data Security",
    items: [
      { detail: "All data is transmitted over HTTPS — your connection to devHive is always encrypted." },
      { detail: "Passwords are hashed using bcrypt and are never stored in plain text." },
      { detail: "Authentication is handled via HTTP-only, Secure JWT cookies that are inaccessible to JavaScript." },
      { detail: "Our database is hosted on cloud infrastructure with strict access controls and regular backups." },
    ],
  },
  {
    num: "05",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "Your Rights (Indian IT Act 2000 & SPDI Rules 2011)",
    items: [
      { detail: "Access your personal data at any time through your Profile page." },
      { detail: "Correct or update inaccurate information via Profile edit." },
      { detail: "Request deletion of your account and personal data by emailing support@devhive.app." },
      { detail: "Withdraw consent by deleting your account — this stops all further processing of your data." },
    ],
  },
  {
    num: "06",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Cookies",
    items: [
      { detail: "We use a single HTTP-only authentication cookie to keep you logged in." },
      { detail: "This cookie has the Secure flag set — it is only sent over HTTPS." },
      { detail: "We use no advertising, tracking, or third-party analytics cookies." },
      { detail: "The cookie is deleted when you log out." },
    ],
  },
  {
    num: "07",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Age Requirement",
    items: [
      { detail: "devHive is strictly for users aged 18 and older." },
      { detail: "We do not knowingly collect or store personal data from anyone under 18." },
      { detail: "If we discover a minor has created an account, it will be immediately deleted." },
    ],
  },
  {
    num: "08",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: "Third-Party Services",
    items: [
      { label: "Razorpay", detail: "Payment processing — razorpay.com/privacy" },
      { label: "Render", detail: "Backend API hosting — render.com/privacy" },
      { label: "MongoDB Atlas", detail: "Cloud database — mongodb.com/legal/privacy-policy" },
      { label: "Vercel", detail: "Frontend hosting — vercel.com/legal/privacy-policy" },
    ],
  },
  {
    num: "09",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: "Changes to This Policy",
    items: [
      { detail: "We may update this Privacy Policy from time to time." },
      { detail: "We will notify users of significant changes via email or an in-app notice." },
      { detail: "Continued use of devHive after changes take effect constitutes acceptance of the updated policy." },
      { detail: "The date at the top of this page always reflects when the policy was last updated." },
    ],
  },
];

const Privacy = () => {
  return (
    <div className="min-h-screen bg-base-100">

      {/* Hero header */}
      <div className="bg-linear-to-br from-primary/10 via-base-200 to-secondary/10 border-b border-base-content/10">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/" className="text-sm text-base-content/50 hover:text-primary transition-colors">devHive</Link>
            <span className="text-base-content/30">/</span>
            <span className="text-sm text-base-content/70">Privacy Policy</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
              <p className="text-base-content/60 text-sm sm:text-base">DevHive Technologies · India</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs bg-base-300 border border-base-content/10 px-3 py-1 rounded-full text-base-content/60">Last updated: April 2026</span>
                <span className="text-xs bg-base-300 border border-base-content/10 px-3 py-1 rounded-full text-base-content/60">Effective: April 2026</span>
                <span className="text-xs bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary font-medium">IT Act 2000 · SPDI Rules 2011</span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-base-content/70 text-sm sm:text-base leading-relaxed max-w-2xl">
            At DevHive Technologies, we take your privacy seriously. This policy explains what data we collect,
            how we use it, and your rights as a user of devHive — the developer networking platform.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14 pb-24 sm:pb-14">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sticky sidebar TOC (desktop) */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">Contents</p>
              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.num}
                    href={`#section-${s.num}`}
                    className="text-sm text-base-content/60 hover:text-primary transition-colors py-1 flex items-center gap-2"
                  >
                    <span className="text-[10px] font-mono text-base-content/30">{s.num}</span>
                    {s.title}
                  </a>
                ))}
                <a href="#contact" className="text-sm text-base-content/60 hover:text-primary transition-colors py-1 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-base-content/30">10</span>
                  Contact Us
                </a>
              </nav>
            </div>
          </aside>

          {/* Sections */}
          <div className="flex-1 flex flex-col gap-0">
            {sections.map((section, i) => (
              <div key={section.num} id={`section-${section.num}`}>
                <div className="py-8">
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
                      {section.icon}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-mono text-base-content/30">{section.num}</span>
                      <h2 className="text-base sm:text-lg font-bold">{section.title}</h2>
                    </div>
                  </div>

                  {/* Items */}
                  <ul className="flex flex-col gap-3">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-base-content/75 leading-relaxed pl-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-2 shrink-0" />
                        <span>
                          {item.label && (
                            <span className="font-semibold text-base-content">{item.label}: </span>
                          )}
                          {item.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {i < sections.length - 1 && (
                  <hr className="border-base-content/8" />
                )}
              </div>
            ))}

            {/* Contact section */}
            <div id="contact" className="pt-8">
              <hr className="border-base-content/8 mb-8" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono text-base-content/30">10</span>
                  <h2 className="text-base sm:text-lg font-bold">Contact Us</h2>
                </div>
              </div>

              <p className="text-sm text-base-content/70 mb-5 pl-1">
                For privacy-related questions, data access requests, or account deletion, please reach out:
              </p>

              <div className="bg-base-200 border border-base-content/10 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col gap-3 flex-1">
                  {[
                    { label: "Email", value: "support@devhive.app", href: "mailto:support@devhive.app" },
                    { label: "Company", value: "DevHive Technologies, India" },
                    { label: "Response time", value: "Within 2 business days" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3 text-sm">
                      <span className="text-base-content/40 w-28 shrink-0">{row.label}</span>
                      {row.href ? (
                        <a href={row.href} className="text-primary hover:underline font-medium">{row.value}</a>
                      ) : (
                        <span className="text-base-content/80">{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/15 text-primary self-start sm:self-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Back link */}
            <div className="mt-12 pt-6 border-t border-base-content/10 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-1.5 text-sm text-base-content/50 hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to devHive
              </Link>
              <span className="text-xs text-base-content/30">© 2026 DevHive Technologies</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
