import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import axios from "axios";
// import GoogleAuthButton from "./GoogleAuthButton";

const BASE_URL      = import.meta.env.VITE_API_BASE_URL;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
// Cloudinary config read inline in uploadToCloudinary for reliable Vite env resolution

/* ─── validators ─── */
const isValidEmail  = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidUrl    = (v) => { try { new URL(v); return true; } catch { return false; } };

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
const AlertIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
  </svg>
);
const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
  </svg>
);

/* ─── floating-label input ─── */
const FloatInput = ({
  id, label, type = "text", value, onChange, onBlur,
  autoComplete, placeholder, error, success, disabled,
  suffix, inputMode, optional,
}) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || String(value).length > 0;

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
          "placeholder:text-base-content/25 transition-all duration-200 outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          suffix ? "pr-11" : "",
          error
            ? "border-error/60 focus:border-error focus:ring-2 focus:ring-error/15"
            : success
            ? "border-success/50 focus:border-success/70 focus:ring-2 focus:ring-success/12"
            : "border-base-content/12 focus:border-primary/60 focus:ring-2 focus:ring-primary/12",
        ].join(" ")}
      />
      <label
        htmlFor={id}
        className={[
          "pointer-events-none absolute left-4 font-medium transition-all duration-200 select-none flex items-center gap-1",
          lifted ? "top-2 text-[10px] tracking-wide uppercase" : "top-1/2 -translate-y-1/2 text-sm",
          error   ? "text-error/70"
          : success ? "text-success/70"
          : focused  ? "text-primary/70"
          : "text-base-content/40",
        ].join(" ")}
      >
        {label}
        {optional && lifted && (
          <span className="text-[9px] normal-case tracking-normal font-normal text-base-content/25">(optional)</span>
        )}
      </label>
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
  const score  = checks.filter(Boolean).length;
  const colors = ["", "bg-error", "bg-warning", "bg-success", "bg-success"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const textCls= score <= 1 ? "text-error" : score === 2 ? "text-warning" : "text-success";
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-base-content/10"}`}/>
        ))}
      </div>
      <p className={`text-[11px] font-medium ${textCls}`}>{labels[score]}</p>
    </div>
  );
};

/* ─── inline field error ─── */
const FieldErr = ({ msg }) =>
  msg ? (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-error leading-snug">
      <AlertIcon className="h-3 w-3"/> {msg}
    </p>
  ) : null;

/* ─── banner error ─── */
const BannerError = ({ msg, shake, onClose }) =>
  msg ? (
    <div className={`flex items-start gap-2.5 rounded-xl border border-error/25 bg-error/8 px-3.5 py-3 text-xs text-error mb-5 ${shake ? "shake" : ""}`}>
      <AlertIcon/>
      <span className="flex-1 leading-snug">{msg}</span>
      <button onClick={onClose} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  ) : null;

/* ─── toast ─── */
const Toast = ({ type, msg, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const styles = { success: "bg-success text-success-content", error: "bg-error text-error-content" };
  return (
    <div className={`fixed top-5 right-5 z-9999 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium max-w-xs animate-[toastIn_0.3s_ease] ${styles[type]}`}>
      {type === "success" ? <CheckIcon/> : <AlertIcon/>}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity ml-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
};

/* ─── step progress bar ─── */
const StepBar = ({ current, total = 3 }) => (
  <div className="flex items-center gap-1.5 mb-6">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`h-1 rounded-full transition-all duration-500 ${
          i < current ? "bg-primary" : i === current - 1 ? "bg-primary" : "bg-base-content/12"
        } ${i === 0 ? "flex-2" : "flex-1"}`}
        style={{ flex: i < current ? 2 : 1 }}
      />
    ))}
    <span className="text-[11px] text-base-content/35 font-semibold ml-1 shrink-0">{current}/{total}</span>
  </div>
);

/* ─── left panel data ─── */
const FEATURES = [
  { icon: "🔍", text: "Discover developer profiles" },
  { icon: "🤝", text: "Connect & collaborate"       },
  { icon: "💬", text: "Real-time messaging"         },
  { icon: "🚀", text: "Build projects together"     },
];
const SEEDS = ["Felix","Mia","Leo","Sara"];

const STEP_META = {
  1: { title: "Create your account",    sub: "Start with your email or Google"           },
  2: { title: "Tell us about yourself", sub: "Help other developers find and know you"   },
  3: { title: "Finish your profile",    sub: "Add a photo — optional but recommended"    },
};

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const Signup = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  /* redirect if already logged in */
  const user = useSelector(s => s.user);
  useEffect(() => { if (user) navigate("/discover", { replace: true }); }, [user, navigate]);

  /* step */
  const [step, setStep] = useState(1);

  /* step 1 */
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd,         setShowPwd]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);

  /* step 2 */
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [age,       setAge]       = useState("");
  const [gender,    setGender]    = useState("");

  /* step 3 */
  const [photoUrl,       setPhotoUrl]       = useState("");
  const [localFile,      setLocalFile]      = useState(null);
  const [localPreviewUrl,setLocalPreviewUrl]= useState(null);
  const [uploadState,    setUploadState]    = useState("idle"); // "idle"|"uploading"|"done"|"error"
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError,    setUploadError]    = useState(null);
  const [isDragOver,     setIsDragOver]     = useState(false);
  const fileInputRef = useRef(null);

  /* UI */
  const [loading,      setLoading]      = useState(false);
  const [shake,        setShake]        = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const [toast,        setToast]        = useState(null);
  const [fieldErrors,  setFieldErrors]  = useState({});
  const [submitError,  setSubmitError]  = useState("");
  const [slideDir,     setSlideDir]     = useState("right"); // "right" | "left"
  const [animKey,      setAnimKey]      = useState(0);       // force re-mount on step change

  useEffect(() => { setMounted(true); }, []);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  /* ── per-field validators ── */
  const validateField = useCallback((field, val) => {
    switch (field) {
      case "email":
        if (!val.trim())      return "Email is required";
        if (!isValidEmail(val)) return "Enter a valid email address";
        return null;
      case "password":
        if (!val)             return "Password is required";
        if (val.length < 8)   return "At least 8 characters required";
        return null;
      case "confirmPassword":
        if (!val)             return "Please confirm your password";
        if (val !== password) return "Passwords do not match";
        return null;
      case "firstName":
        if (!val.trim())      return "First name is required";
        if (val.trim().length < 2) return "Minimum 2 characters";
        if (!/^[a-zA-Z\s'-]+$/.test(val)) return "Letters only";
        return null;
      case "lastName":
        if (!val.trim())      return "Last name is required";
        if (val.trim().length < 2) return "Minimum 2 characters";
        if (!/^[a-zA-Z\s'-]+$/.test(val)) return "Letters only";
        return null;
      case "age": {
        if (!val)             return "Age is required";
        const n = Number(val);
        if (!Number.isInteger(n) || n < 18 || n > 100) return "Must be between 18 – 100";
        return null;
      }
      case "gender":
        if (!val)             return "Please select your gender";
        return null;
      case "photoUrl":
        if (val && !isValidUrl(val)) return "Enter a valid URL (https://...)";
        return null;
      default: return null;
    }
  }, [password]);

  const setErr = (field, msg) =>
    setFieldErrors(prev => ({ ...prev, [field]: msg }));

  const handleBlur = (field) => (e) => {
    setErr(field, validateField(field, e.target.value));
  };

  const clearErr = (field) => {
    if (fieldErrors[field]) setErr(field, null);
    if (submitError)        setSubmitError("");
  };

  /* ── step validators ── */
  const validateStep1 = () => {
    const errs = {
      email:           validateField("email",           email),
      password:        validateField("password",        password),
      confirmPassword: validateField("confirmPassword", confirmPassword),
    };
    setFieldErrors(errs);
    return !errs.email && !errs.password && !errs.confirmPassword;
  };

  const validateStep2 = () => {
    const errs = {
      firstName: validateField("firstName", firstName),
      lastName:  validateField("lastName",  lastName),
      age:       validateField("age",       age),
      gender:    validateField("gender",    gender),
    };
    setFieldErrors(errs);
    return !errs.firstName && !errs.lastName && !errs.age && !errs.gender;
  };

  /* ── blob URL cleanup on unmount ── */
  useEffect(() => {
    return () => { if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl); };
  }, [localPreviewUrl]);

  /* ── file validation & selection ── */
  const handleFileSelect = (file) => {
    setUploadError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Only JPG, PNG, WebP, or GIF images are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`Image must be under 5 MB (yours is ${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      return;
    }
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalFile(file);
    setLocalPreviewUrl(URL.createObjectURL(file));
    setUploadState("idle");
    setUploadProgress(0);
  };

  const clearLocalFile = () => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalFile(null);
    setLocalPreviewUrl(null);
    setUploadState("idle");
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Cloudinary upload via XHR (for real progress) ── */
  const uploadToCloudinary = (file) => {
    const cloud  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    console.log("[Cloudinary] cloud:", cloud, "| preset:", preset);
    if (!cloud || !preset) {
      setUploadState("error");
      setUploadError("Cloudinary config missing — restart dev server after saving .env");
      return Promise.reject(new Error("Missing Cloudinary env vars"));
    }
    setUploadState("uploading");
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);
    // folder is configured in the preset itself

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setUploadState("done");
          setUploadProgress(100);
          resolve(data.secure_url);
        } else {
          setUploadState("error");
          const msg = (() => {
            try { return JSON.parse(xhr.responseText)?.error?.message || "Upload failed"; }
            catch { return "Upload service error. Please try again."; }
          })();
          reject(new Error(msg));
        }
      });
      xhr.addEventListener("error", () => {
        setUploadState("error");
        reject(new Error("Network error — check your connection and try again."));
      });
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloud}/image/upload`);
      xhr.send(formData);
    });
  };

  const validateStep3 = () => true; // photo is optional, no URL field anymore

  /* ── navigation ── */
  const goNext = () => {
    setSubmitError("");
    const valid = step === 1 ? validateStep1() : validateStep2();
    if (!valid) { triggerShake(); return; }
    setSlideDir("right");
    setAnimKey(k => k + 1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    setSubmitError("");
    setFieldErrors({});
    setSlideDir("left");
    setAnimKey(k => k + 1);
    setStep(s => s - 1);
  };

  /* ── final submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      setLoading(true);
      let finalPhotoUrl = photoUrl;

      /* Upload local file to Cloudinary first if one was picked */
      if (localFile && uploadState !== "done") {
        try {
          finalPhotoUrl = await uploadToCloudinary(localFile);
          setPhotoUrl(finalPhotoUrl);
        } catch (uploadErr) {
          setUploadError(uploadErr.message || "Upload failed. Please try again.");
          setSubmitError("Image upload failed — please try again or skip the photo.");
          triggerShake();
          setLoading(false);
          return;
        }
      }

      const res = await axios.post(
        BASE_URL + "/auth/signup",
        {
          firstName:  firstName.trim(),
          lastName:   lastName.trim(),
          emailId:    email.trim().toLowerCase(),
          PassWord:   password,
          age:        Number(age),
          gender,
          photo:      finalPhotoUrl || undefined,
        },
        { withCredentials: true }
      );
      const payload = res.data?.user ?? res.data?.data ?? res.data;
      dispatch(addUser(payload));
      setToast({ type: "success", msg: "Account created! Welcome 🎉" });
      setTimeout(() => navigate("/discover", { replace: true }), 900);
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 409) {
        setSubmitError("An account with this email already exists.");
        setStep(1);
        setFieldErrors(prev => ({ ...prev, email: "Email already in use" }));
      } else if (status === 422 || status === 400) {
        setSubmitError(message || "Please check your details and try again.");
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

  /* ── photo preview ── */
  const FALLBACK = `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName || "default"}`;
  const previewSrc = localPreviewUrl ?? (photoUrl || FALLBACK);

  /* ── password match indicator ── */
  const pwdMatch = confirmPassword.length > 0 && confirmPassword === password;
  const pwdMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <>
      <style>{`
        @keyframes shake      { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn    { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInR   { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInL   { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes orbFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        .shake      { animation: shake 0.45s ease; }
        .slide-r    { animation: slideInR 0.28s ease forwards; }
        .slide-l    { animation: slideInL 0.28s ease forwards; }
        .orb-a      { animation: orbFloat 7s  ease-in-out infinite; }
        .orb-b      { animation: orbFloat 9s  ease-in-out infinite 1.5s; }
        .orb-c      { animation: orbFloat 11s ease-in-out infinite 3s; }
      `}</style>

      {toast && <Toast type={toast.type} msg={toast.msg} onClose={() => setToast(null)}/>}

      <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">

        {/* ══════════ LEFT PANEL ══════════ */}
        <div
          className="hidden lg:flex w-[42%] shrink-0 relative overflow-hidden flex-col"
          style={{ background: "linear-gradient(145deg,#2d1b69 0%,#6d28d9 40%,#a855f7 75%,#ec4899 100%)" }}
        >
          {/* grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* orbs */}
          <div className="orb-a absolute -top-10 -left-10 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(255,255,255,0.18) 0%,transparent 70%)" }}/>
          <div className="orb-b absolute bottom-10 -right-10 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(255,255,255,0.12) 0%,transparent 70%)" }}/>
          <div className="orb-c absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 70%)" }}/>

          {/* scrollable inner */}
          <div className="relative z-10 flex flex-col justify-center h-full overflow-y-auto no-scrollbar px-8 xl:px-12 py-10 gap-7">

            {/* logo + copy */}
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg mx-auto mb-4 shadow-2xl border border-white/20"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)" }}
              >dH</div>
              <h1 className="text-2xl font-black text-white tracking-tight">devHive</h1>
              <p className="mt-2 text-white/60 text-xs leading-relaxed max-w-55 mx-auto">
                Join thousands of developers discovering meaningful professional connections.
              </p>
            </div>

            {/* feature pills */}
            <div className="flex flex-col gap-2">
              {FEATURES.map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/15"
                  style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
                >
                  <span className="text-base shrink-0">{icon}</span>
                  <span className="text-sm text-white/85 font-medium">{text}</span>
                  <div className="ml-auto w-5 h-5 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* social proof */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/15"
              style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
            >
              <div className="flex -space-x-2 shrink-0">
                {SEEDS.map(s => (
                  <img key={s} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s}`} alt=""
                    className="w-8 h-8 rounded-full border-2 border-white/30 bg-purple-800"/>
                ))}
              </div>
              <div className="min-w-0">
                <p className="text-white/80 text-xs font-semibold"><span className="text-white font-bold">10,000+</span> developers</p>
                <p className="text-white/40 text-[11px]">already on devHive</p>
              </div>
            </div>

          </div>
        </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div className="flex-1 min-w-0 flex items-center justify-center bg-base-100 no-scrollbar overflow-y-auto px-6 py-8">
          <div
            className="w-full max-w-sm"
            style={{ opacity: 0, animation: mounted ? "fadeUp 0.4s ease 0.08s forwards" : "none" }}
          >

            {/* mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-md"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>dH</div>
              <span className="font-extrabold text-base-content text-base tracking-tight">devHive</span>
            </div>

            {/* step bar */}
            <StepBar current={step} total={3}/>

            {/* step heading */}
            <div className="mb-5">
              <h1 className="text-2xl font-black text-base-content tracking-tight leading-tight">
                {STEP_META[step].title}
              </h1>
              <p className="text-base-content/40 text-sm mt-1">{STEP_META[step].sub}</p>
            </div>

            {/* banner error */}
            <BannerError msg={submitError} shake={shake} onClose={() => setSubmitError("")}/>

            {/* ════ animated step container ════ */}
            <div
              key={animKey}
              className={slideDir === "right" ? "slide-r" : "slide-l"}
            >

              {/* ══ STEP 1 ══ */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  {/* <GoogleAuthButton/> */}

                  {/* <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-base-content/8"/>
                    <span className="text-[10px] text-base-content/25 font-semibold tracking-widest uppercase">or</span>
                    <div className="flex-1 h-px bg-base-content/8"/>
                  </div> */}

                  {/* email */}
                  <div>
                    <FloatInput
                      id="su-email" label="Email address" type="email" inputMode="email"
                      value={email} onChange={e => { setEmail(e.target.value); clearErr("email"); }}
                      onBlur={handleBlur("email")} autoComplete="email" placeholder="you@example.com"
                      error={!!fieldErrors.email}
                      success={!fieldErrors.email && isValidEmail(email)}
                      suffix={!fieldErrors.email && isValidEmail(email)
                        ? <span className="text-success"><CheckIcon/></span> : null}
                    />
                    <FieldErr msg={fieldErrors.email}/>
                  </div>

                  {/* password */}
                  <div>
                    <FloatInput
                      id="su-password" label="Password" type={showPwd ? "text" : "password"}
                      value={password} onChange={e => { setPassword(e.target.value); clearErr("password"); clearErr("confirmPassword"); }}
                      onBlur={handleBlur("password")} autoComplete="new-password" placeholder="Min. 8 characters"
                      error={!!fieldErrors.password}
                      suffix={
                        <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                          className="text-base-content/30 hover:text-base-content/70 transition-colors"
                          aria-label={showPwd ? "Hide password" : "Show password"}>
                          {showPwd ? <EyeClosed/> : <EyeOpen/>}
                        </button>
                      }
                    />
                    <FieldErr msg={fieldErrors.password}/>
                    <PasswordStrength password={password}/>
                  </div>

                  {/* confirm password */}
                  <div>
                    <FloatInput
                      id="su-confirm" label="Confirm password" type={showConfirm ? "text" : "password"}
                      value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); clearErr("confirmPassword"); }}
                      onBlur={handleBlur("confirmPassword")} autoComplete="new-password" placeholder="Re-enter password"
                      error={!!fieldErrors.confirmPassword || pwdMismatch}
                      success={pwdMatch}
                      suffix={
                        <div className="flex items-center gap-1.5">
                          {pwdMatch    && <span className="text-success"><CheckIcon/></span>}
                          {pwdMismatch && <span className="text-error"><AlertIcon className="h-4.5 w-4.5"/></span>}
                          <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
                            className="text-base-content/30 hover:text-base-content/70 transition-colors"
                            aria-label={showConfirm ? "Hide" : "Show"}>
                            {showConfirm ? <EyeClosed/> : <EyeOpen/>}
                          </button>
                        </div>
                      }
                    />
                    <FieldErr msg={fieldErrors.confirmPassword}/>
                  </div>

                  <button type="button" onClick={goNext}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white mt-1 transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.99]"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
                    Continue <ChevronRight/>
                  </button>
                </div>
              )}

              {/* ══ STEP 2 ══ */}
              {step === 2 && (
                <div className="flex flex-col gap-4">

                  {/* name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FloatInput
                        id="su-fname" label="First name"
                        value={firstName} onChange={e => { setFirstName(e.target.value); clearErr("firstName"); }}
                        onBlur={handleBlur("firstName")} autoComplete="given-name" placeholder="John"
                        error={!!fieldErrors.firstName}
                        success={!fieldErrors.firstName && firstName.trim().length >= 2}
                      />
                      <FieldErr msg={fieldErrors.firstName}/>
                    </div>
                    <div>
                      <FloatInput
                        id="su-lname" label="Last name"
                        value={lastName} onChange={e => { setLastName(e.target.value); clearErr("lastName"); }}
                        onBlur={handleBlur("lastName")} autoComplete="family-name" placeholder="Doe"
                        error={!!fieldErrors.lastName}
                        success={!fieldErrors.lastName && lastName.trim().length >= 2}
                      />
                      <FieldErr msg={fieldErrors.lastName}/>
                    </div>
                  </div>

                  {/* age */}
                  <div>
                    <FloatInput
                      id="su-age" label="Age" type="number" inputMode="numeric"
                      value={age} onChange={e => { setAge(e.target.value); clearErr("age"); }}
                      onBlur={handleBlur("age")} placeholder="e.g. 25"
                      error={!!fieldErrors.age}
                      success={!fieldErrors.age && !!age && Number(age) >= 18 && Number(age) <= 100}
                    />
                    <FieldErr msg={fieldErrors.age}/>
                  </div>

                  {/* gender — custom styled select */}
                  <div className="relative">
                    <select
                      id="su-gender"
                      value={gender}
                      onChange={e => { setGender(e.target.value); clearErr("gender"); }}
                      onBlur={handleBlur("gender")}
                      className={[
                        "w-full rounded-xl border bg-base-200/40 px-4 pt-6 pb-2.5 text-sm text-base-content appearance-none",
                        "transition-all duration-200 outline-none cursor-pointer pr-10",
                        fieldErrors.gender
                          ? "border-error/60 focus:border-error focus:ring-2 focus:ring-error/15"
                          : gender
                          ? "border-success/50 focus:border-success/70 focus:ring-2 focus:ring-success/12"
                          : "border-base-content/12 focus:border-primary/60 focus:ring-2 focus:ring-primary/12",
                      ].join(" ")}
                    >
                      <option value="" disabled/>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other / Prefer not to say</option>
                    </select>
                    <label
                      htmlFor="su-gender"
                      className={[
                        "pointer-events-none absolute left-4 font-medium transition-all duration-200 select-none",
                        gender ? "top-2 text-[10px] tracking-wide uppercase" : "top-1/2 -translate-y-1/2 text-sm",
                        fieldErrors.gender ? "text-error/70" : gender ? "text-success/70" : "text-base-content/40",
                      ].join(" ")}
                    >Gender</label>
                    {/* chevron */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                    {gender && (
                      <div className="absolute right-9 top-1/2 -translate-y-1/2 text-success"><CheckIcon/></div>
                    )}
                    <FieldErr msg={fieldErrors.gender}/>
                  </div>

                  {/* back + continue */}
                  <div className="flex gap-3 mt-1">
                    <button type="button" onClick={goBack}
                      className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl border border-base-content/12 bg-base-200/50 hover:bg-base-200 transition-all text-sm font-medium text-base-content/60">
                      <ChevronLeft/> Back
                    </button>
                    <button type="button" onClick={goNext}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.99]"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
                      Continue <ChevronRight/>
                    </button>
                  </div>
                </div>
              )}

              {/* ══ STEP 3 ══ */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* profile preview card */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-base-content/8 bg-base-200/30">
                    <div className="relative shrink-0">
                      <img
                        src={previewSrc}
                        alt="Preview"
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20 ring-offset-2 ring-offset-base-200/30"
                      />
                      {uploadState === "uploading" ? (
                        <span className="absolute inset-0 rounded-full bg-base-300/70 flex items-center justify-center">
                          <svg className="w-4 h-4 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                          </svg>
                        </span>
                      ) : (
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-base-100"/>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-base-content truncate">{firstName} {lastName}</p>
                      <p className="text-xs text-base-content/40 truncate">{email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-base-content/30 bg-base-content/8 px-2 py-0.5 rounded-full capitalize">{gender}</span>
                        <span className="text-[10px] font-semibold text-base-content/30 bg-base-content/8 px-2 py-0.5 rounded-full">{age} yrs</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setStep(2)}
                      className="shrink-0 text-[10px] text-primary/60 hover:text-primary transition-colors font-medium underline underline-offset-2">
                      Edit
                    </button>
                  </div>

                  {/* ── Photo upload zone ── */}
                  <div className="flex flex-col gap-2.5">

                    {/* hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
                    />

                    {!localFile ? (
                      /* Drag & drop / tap zone */
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFileSelect(f); }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex items-center gap-3 sm:flex-col sm:items-center sm:justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all px-4 py-4 sm:py-6 select-none active:scale-[0.98]
                          ${isDragOver
                            ? "border-primary/70 bg-primary/8"
                            : "border-base-content/15 bg-base-200/40 hover:border-primary/40 hover:bg-primary/5"}`}
                      >
                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-colors ${isDragOver ? "bg-primary/20" : "bg-base-content/6"}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isDragOver ? "text-primary" : "text-base-content/35"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </div>
                        <div className="sm:text-center">
                          <p className={`text-sm font-semibold leading-snug transition-colors ${isDragOver ? "text-primary" : "text-base-content/60"}`}>
                            {isDragOver
                              ? "Drop image here"
                              : <><span className="sm:hidden">Tap to add a photo</span><span className="hidden sm:inline">Click or drag & drop</span></>}
                          </p>
                          <p className="text-[11px] text-base-content/30 mt-0.5">JPG, PNG, WebP or GIF · max 5 MB · optional</p>
                        </div>
                      </div>
                    ) : (
                      /* File selected — preview row */
                      <div className="rounded-xl border border-base-content/10 bg-base-200/50 px-3.5 py-3 flex items-center gap-3">
                        <img
                          src={localPreviewUrl}
                          alt="Preview"
                          className="w-11 h-11 rounded-xl object-cover shrink-0 ring-1 ring-base-content/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-base-content truncate">{localFile.name}</p>
                          <p className="text-[11px] text-base-content/40 mt-0.5">{(localFile.size / 1024).toFixed(0)} KB · {localFile.type.split("/")[1].toUpperCase()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={clearLocalFile}
                          disabled={uploadState === "uploading"}
                          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base-content/30 hover:text-error hover:bg-error/10 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Remove selected image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Upload progress */}
                    {uploadState === "uploading" && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-base-content/50 flex items-center gap-1.5">
                            <span className="w-3 h-3 border-2 border-primary/40 border-t-primary rounded-full animate-spin shrink-0"/>
                            Uploading…
                          </span>
                          <span className="text-[11px] font-bold text-primary tabular-nums">{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-base-content/8 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%`, background: "linear-gradient(90deg,#6366f1,#c084fc)" }}/>
                        </div>
                      </div>
                    )}

                    {/* Upload done */}
                    {uploadState === "done" && (
                      <div className="flex items-center gap-1.5 text-[11px] text-success font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                        Photo ready — will be saved with your account
                      </div>
                    )}

                    {/* Upload error */}
                    {uploadError && (
                      <div className="flex items-start gap-1.5 text-[11px] text-error">
                        <AlertIcon className="h-3.5 w-3.5 mt-0.5 shrink-0"/>
                        {uploadError}
                      </div>
                    )}
                  </div>

                  {/* back + create */}
                  <div className="flex gap-3 mt-1">
                    <button type="button" onClick={goBack}
                      className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl border border-base-content/12 bg-base-200/50 hover:bg-base-200 transition-all text-sm font-medium text-base-content/60">
                      <ChevronLeft/> Back
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.99]"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                          Creating…
                        </>
                      ) : (
                        <>
                          <CheckIcon/> Create Account
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>{/* end animated step container */}

            {/* footer */}
            <div className="mt-6 space-y-2.5">
              <p className="text-center text-sm text-base-content/40">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
              <p className="text-center text-[11px] text-base-content/20 leading-relaxed">
                By continuing, you agree to our{" "}
                <Link to="/privacy" className="underline hover:text-base-content/40 transition-colors">Terms &amp; Privacy Policy</Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
