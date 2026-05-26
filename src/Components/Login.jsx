import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import axios from "axios";
// import GoogleAuthButton from "./GoogleAuthButton";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ─── tiny validators ─── */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/* ─── SVG atoms ─── */
const EyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
);
const EyeClosed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
  </svg>
);
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);

/* ─── floating-label input ─── */
const FloatInput = ({
  id, label, type = "text", value, onChange, onBlur,
  autoComplete, placeholder, error, success, disabled,
  suffix, inputMode,
}) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        autoComplete={autoComplete}
        placeholder={lifted ? placeholder : ""}
        disabled={disabled}
        inputMode={inputMode}
        className={[
          "peer w-full rounded-xl border bg-base-200/40 px-4 pt-6 pb-2.5 text-sm text-base-content",
          "placeholder:text-base-content/30 transition-all duration-200 outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          suffix ? "pr-11" : "",
          error
            ? "border-error/60 focus:border-error focus:ring-2 focus:ring-error/15"
            : success
            ? "border-success/50 focus:border-success/70 focus:ring-2 focus:ring-success/12"
            : "border-base-content/12 focus:border-primary/60 focus:ring-2 focus:ring-primary/12",
        ].join(" ")}
      />
      {/* floating label */}
      <label
        htmlFor={id}
        className={[
          "pointer-events-none absolute left-4 font-medium transition-all duration-200 select-none",
          lifted ? "top-2 text-[10px] tracking-wide uppercase" : "top-1/2 -translate-y-1/2 text-sm",
          error
            ? "text-error/70"
            : success
            ? "text-success/70"
            : focused
            ? "text-primary/70"
            : "text-base-content/40",
        ].join(" ")}
      >
        {label}
      </label>
      {/* right slot */}
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
};

/* ─── password strength bar ─── */
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors  = ["bg-error", "bg-error", "bg-warning", "bg-success", "bg-success"];
  const labels  = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : "bg-base-content/10"}`}/>
        ))}
      </div>
      {score > 0 && (
        <p className={`text-[11px] font-medium ${score <= 1 ? "text-error" : score === 2 ? "text-warning" : "text-success"}`}>
          {labels[score]}
        </p>
      )}
    </div>
  );
};

/* ─── inline field error ─── */
const FieldError = ({ msg }) =>
  msg ? (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-error">
      <AlertIcon/> {msg}
    </p>
  ) : null;

/* ─── toast notification ─── */
const Toast = ({ type, msg, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: "bg-success text-success-content",
    error:   "bg-error   text-error-content",
    info:    "bg-info    text-info-content",
  };
  const icons = {
    success: <CheckIcon/>,
    error:   <AlertIcon/>,
    info:    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  };

  return (
    <div className={`fixed top-5 right-5 z-9999 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium max-w-xs ${styles[type]} animate-[toastIn_0.3s_ease]`}>
      {icons[type]}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity ml-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
};

/* ─── left-panel feature pills ─── */
const FEATURES = [
  { icon: "⚡", title: "Instant matching",   desc: "Find devs with your exact stack"   },
  { icon: "🔒", title: "Private & secure",   desc: "Your data is never sold"            },
  { icon: "💬", title: "Real-time chat",     desc: "Message matched developers"         },
  { icon: "🌍", title: "Global community",   desc: "10,000+ engineers worldwide"        },
];
const SEEDS = ["Felix","Aneka","Mia","Leo","Sara"];

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const Login = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const emailRef  = useRef(null);

  /* redirect if already logged in */
  const user = useSelector(s => s.user);
  useEffect(() => {
    if (user) navigate("/discover", { replace: true });
  }, [user, navigate]);

  /* where to go after login */
  const from = location.state?.from || "/discover";

  /* form state */
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPwd,      setShowPwd]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);   // { type, msg }
  const [fieldErrors,  setFieldErrors]  = useState({});     // { email?, password? }
  const [submitError,  setSubmitError]  = useState("");
  const [shake,        setShake]        = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const [attempts,     setAttempts]     = useState(0);      // track failed attempts
  const [rateLimited,  setRateLimited]  = useState(false);
  const [cooldown,     setCooldown]     = useState(0);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => emailRef.current?.focus(), 350);
  }, []);

  /* cooldown timer after too many failures */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => {
      if (c <= 1) { setRateLimited(false); clearInterval(t); return 0; }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  /* per-field blur validation */
  const validateField = useCallback((field, val) => {
    if (field === "email") {
      if (!val) return "Email is required";
      if (!isValidEmail(val)) return "Enter a valid email address";
      return null;
    }
    if (field === "password") {
      if (!val) return "Password is required";
      if (val.length < 6) return "Password must be at least 6 characters";
      return null;
    }
    return null;
  }, []);

  const handleBlur = (field) => (e) => {
    const err = validateField(field, e.target.value);
    setFieldErrors(prev => ({ ...prev, [field]: err }));
  };

  /* full form validation before submit */
  const validateAll = () => {
    const errs = {
      email:    validateField("email",    email),
      password: validateField("password", password),
    };
    setFieldErrors(errs);
    return !errs.email && !errs.password;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (rateLimited) return;
    if (!validateAll()) { triggerShake(); return; }

    try {
      setLoading(true);
      const res = await axios.post(
        BASE_URL + "/api/auth/login",
        { emailId: email.trim().toLowerCase(), PassWord: password },
        { withCredentials: true }
      );
      const userPayload = res.data?.user ?? res.data?.data ?? res.data;
      dispatch(addUser(userPayload));
      setToast({ type: "success", msg: "Welcome back! 🎉" });
      setTimeout(() => navigate(from, { replace: true }), 800);
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message;

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      /* 5 failed attempts → 30 s cooldown */
      if (newAttempts >= 5) {
        setRateLimited(true);
        setCooldown(30);
        setSubmitError("Too many failed attempts. Please wait 30 seconds.");
        triggerShake();
        setLoading(false);
        return;
      }

      if (status === 401 || status === 400) {
        setSubmitError(message || "Incorrect email or password.");
      } else if (status === 403) {
        setSubmitError("Your account has been suspended. Contact support.");
      } else if (status === 429) {
        setRateLimited(true);
        setCooldown(60);
        setSubmitError("Too many requests. Please wait before trying again.");
      } else if (!err.response) {
        setSubmitError("Network error — check your connection and retry.");
      } else {
        setSubmitError(message || "Something went wrong. Please try again.");
      }
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  /* clear submit-level error the moment user edits */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (submitError) setSubmitError("");
    if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: null }));
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (submitError) setSubmitError("");
    if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: null }));
  };

  const isFormDisabled = loading || rateLimited;

  return (
    <>
      <style>{`
        @keyframes shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.04)} }
        @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .shake { animation: shake 0.45s ease; }
        .orb-1 { animation: orbFloat 7s ease-in-out infinite; }
        .orb-2 { animation: orbFloat 9s ease-in-out infinite 1.5s; }
        .orb-3 { animation: orbFloat 11s ease-in-out infinite 3s; }
      `}</style>

      {/* toast */}
      {toast && <Toast type={toast.type} msg={toast.msg} onClose={() => setToast(null)}/>}

      <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">

        {/* ══════════ LEFT PANEL ══════════ */}
        <div
          className="hidden lg:flex w-[42%] shrink-0 relative overflow-hidden flex-col items-center justify-center"
          style={{ background: "linear-gradient(145deg,#0f0c29 0%,#1e1b4b 40%,#2d1b69 70%,#1a0533 100%)" }}
        >
          {/* animated grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "linear-gradient(rgba(139,92,246,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.9) 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* glowing orbs */}
          <div className="orb-1 absolute top-16 left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)" }}/>
          <div className="orb-2 absolute bottom-20 right-8 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)" }}/>
          <div className="orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)" }}/>

          {/* inner content — scrollable so it never overflows on short screens */}
          <div className="relative z-10 w-full h-full overflow-y-auto no-scrollbar flex flex-col justify-center px-8 xl:px-12 py-8 gap-6">

            {/* logo + heading */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-lg shrink-0"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 20px rgba(99,102,241,0.5)" }}
                >dH</div>
                <span className="text-white font-extrabold text-lg tracking-tight">devHive</span>
              </div>

              <h2 className="text-[1.75rem] font-black text-white leading-[1.2] tracking-tight">
                Where developers<br/>
                <span
                  style={{
                    background: "linear-gradient(135deg,#818cf8,#c084fc,#f472b6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >connect &amp; grow</span>
              </h2>
              <p className="mt-2.5 text-white/45 text-xs leading-relaxed">
                The professional network built exclusively for software engineers.
              </p>
            </div>

            {/* feature list */}
            <div className="flex flex-col gap-2">
              {FEATURES.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 border border-white/8 backdrop-blur-sm"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-sm shrink-0">{icon}</div>
                  <div className="min-w-0">
                    <p className="text-white/90 text-xs font-semibold leading-tight">{title}</p>
                    <p className="text-white/35 text-[11px] mt-0.5">{desc}</p>
                  </div>
                  <div className="ml-auto shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* social proof */}
            <div
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 border border-white/10"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div className="flex -space-x-2 shrink-0">
                {SEEDS.map(s => (
                  <img key={s} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s}`} alt=""
                    className="w-7 h-7 rounded-full border-2 border-white/20 bg-indigo-900"/>
                ))}
              </div>
              <div className="min-w-0">
                <p className="text-white/75 text-xs font-semibold truncate">Joined by <span className="text-white">10,000+</span> engineers</p>
                <p className="text-white/30 text-[11px]">this month alone</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div className="flex-1 min-w-0 flex items-center justify-center bg-base-100 no-scrollbar overflow-y-auto px-6 py-8">
          <div
            className="w-full max-w-sm"
            style={{
              opacity: 0,
              animation: mounted ? "fadeUp 0.4s ease 0.08s forwards" : "none",
            }}
          >

            {/* mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md shrink-0"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              >dH</div>
              <span className="font-extrabold text-base-content text-base tracking-tight">devHive</span>
            </div>

            {/* heading */}
            <div className="mb-6">
              <h1 className="text-2xl font-black text-base-content tracking-tight leading-tight">
                Welcome back
              </h1>
              <p className="text-base-content/40 text-sm mt-1">
                Sign in to continue to your account
              </p>
            </div>

            {/* ── Google button and divider commented out ── */}

            {/* ── submit-level error banner ── */}
            {submitError && (
              <div className={`flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/8 px-3.5 py-3 text-xs text-error mb-5 ${shake ? "shake" : ""}`}>
                <AlertIcon/>
                <span className="flex-1 leading-snug">{submitError}</span>
                <button
                  onClick={() => setSubmitError("")}
                  className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            )}

            {/* ── form ── */}
            <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">

              {/* email */}
              <div>
                <FloatInput
                  id="login-email"
                  label="Email address"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleBlur("email")}
                  autoComplete="email"
                  placeholder="you@example.com"
                  error={!!fieldErrors.email}
                  success={!fieldErrors.email && isValidEmail(email)}
                  disabled={isFormDisabled}
                  suffix={
                    !fieldErrors.email && isValidEmail(email)
                      ? <span className="text-success"><CheckIcon/></span>
                      : null
                  }
                />
                <FieldError msg={fieldErrors.email}/>
              </div>

              {/* password */}
              <div>
                <FloatInput
                  id="login-password"
                  label="Password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handleBlur("password")}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  error={!!fieldErrors.password}
                  disabled={isFormDisabled}
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPwd(v => !v)}
                      className="text-base-content/30 hover:text-base-content/70 transition-colors"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? <EyeClosed/> : <EyeOpen/>}
                    </button>
                  }
                />
                <FieldError msg={fieldErrors.password}/>
              </div>

              {/* forgot password link */}
              <div className="flex justify-end -mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary/70 hover:text-primary transition-colors font-medium"
                  tabIndex={isFormDisabled ? -1 : 0}
                >
                  Forgot password?
                </Link>
              </div>

              {/* rate-limit countdown */}
              {rateLimited && cooldown > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-warning/10 border border-warning/25 px-3.5 py-2.5 text-xs text-warning font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Please wait {cooldown}s before trying again
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={isFormDisabled}
                className="relative w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] overflow-hidden mt-1"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.45)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <span className="w-4 h-4 border-[2px] border-white/30 border-t-white rounded-full animate-spin"/>
                    Signing in…
                  </span>
                ) : rateLimited ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    Locked ({cooldown}s)
                  </span>
                ) : "Sign in"}
              </button>

            </form>

            {/* ── footer links ── */}
            <div className="mt-6 space-y-3">
              <p className="text-center text-sm text-base-content/40">
                No account?{" "}
                <Link to="/signup" className="text-primary font-semibold hover:underline">
                  Create one free
                </Link>
              </p>
              <p className="text-center text-[11px] text-base-content/20 leading-relaxed">
                By signing in you agree to our{" "}
                <Link to="/privacy" className="underline hover:text-base-content/40 transition-colors">
                  Terms &amp; Privacy
                </Link>
              </p>
            </div>

            {/* ── attempts warning (3-4 attempts) ── */}
            {attempts >= 3 && attempts < 5 && !rateLimited && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-warning/8 border border-warning/20 px-3.5 py-2.5 text-[11px] text-warning/80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                {5 - attempts} attempt{5 - attempts !== 1 ? "s" : ""} left before a temporary lockout.
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
