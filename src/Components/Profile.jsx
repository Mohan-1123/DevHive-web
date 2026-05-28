import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import axios from "axios";
import Avatar from "./Avatar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ABOUT_MAX = 280;
// Cloudinary config — read inline in uploadToCloudinary for reliable Vite env resolution
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/* ─── Floating-label input ─── */
const FloatInput = ({ id, label, type = "text", value, onChange, error, hint, readOnly, min, max, autoComplete }) => (
  <div className="relative">
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      min={min}
      max={max}
      autoComplete={autoComplete}
      placeholder=" "
      className={`peer w-full rounded-xl border pt-6 pb-2.5 px-4 text-sm bg-base-200/60 text-base-content placeholder-transparent transition-all focus:outline-none focus:ring-2
        ${readOnly ? "cursor-not-allowed opacity-60 border-base-content/10" : error
          ? "border-error/60 focus:border-error/80 focus:ring-error/15"
          : "border-base-content/12 focus:border-primary/60 focus:ring-primary/15"}`}
    />
    <label
      htmlFor={id}
      className={`absolute left-4 top-2 text-[10px] font-semibold uppercase tracking-wide transition-all
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal
        peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide
        ${readOnly ? "text-base-content/35" : error ? "text-error/80" : "text-base-content/40 peer-focus:text-primary/70"}`}
    >
      {label}
    </label>
    {hint && !error && <p className="mt-1 text-[10px] text-base-content/35">{hint}</p>}
    {error && <p className="mt-1 text-[10px] text-error">{error}</p>}
  </div>
);

/* ─── Floating-label select ─── */
const FloatSelect = ({ id, label, value, onChange }) => (
  <div className="relative">
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="peer w-full rounded-xl border border-base-content/12 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 pt-6 pb-2.5 px-4 text-sm bg-base-200/60 text-base-content focus:outline-none transition-all appearance-none"
    >
      <option value="">Prefer not to say</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
    <label
      htmlFor={id}
      className="absolute left-4 top-2 text-[10px] font-semibold uppercase tracking-wide text-base-content/40 peer-focus:text-primary/70 transition-all"
    >
      {label}
    </label>
    <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/35 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

/* ─── Skills chip editor ─── */
const SkillsEditor = ({ value, onChange }) => {
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const add = (raw) => {
    const s = raw.trim();
    if (!s || value.includes(s)) { setDraft(""); return; }
    onChange([...value, s]);
    setDraft("");
  };
  const remove = (skill) => onChange(value.filter((s) => s !== skill));
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); }
    else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
  };

  const CHIP_COLORS = [
    "bg-violet-500/12 text-violet-400 border-violet-500/20",
    "bg-blue-500/12 text-blue-400 border-blue-500/20",
    "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
    "bg-rose-500/12 text-rose-400 border-rose-500/20",
    "bg-amber-500/12 text-amber-400 border-amber-500/20",
    "bg-cyan-500/12 text-cyan-400 border-cyan-500/20",
    "bg-pink-500/12 text-pink-400 border-pink-500/20",
    "bg-indigo-500/12 text-indigo-400 border-indigo-500/20",
  ];

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex flex-wrap items-center gap-1.5 rounded-xl border border-base-content/12 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 bg-base-200/60 px-3 py-2.5 min-h-11 cursor-text transition-all"
    >
      {value.map((skill, i) => (
        <span
          key={skill}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${CHIP_COLORS[i % CHIP_COLORS.length]}`}
        >
          {skill}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); remove(skill); }}
            className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
            aria-label={`Remove ${skill}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft && add(draft)}
        placeholder={value.length === 0 ? "Type a skill, press Enter…" : ""}
        className="flex-1 min-w-28 bg-transparent text-sm placeholder:text-base-content/30 focus:outline-none px-1"
      />
    </div>
  );
};

/* ─── Toast ─── */
const Toast = ({ toast, onDismiss }) => {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 min-w-72 max-w-[90vw] rounded-2xl border border-base-content/12 bg-base-300/95 backdrop-blur-md shadow-2xl fade-up">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isErr ? "bg-error/15 text-error" : "bg-success/15 text-success"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isErr ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M5 13l4 4L19 7"} />
          </svg>
        </div>
        <span className="text-sm text-base-content flex-1">{toast.message}</span>
        <button onClick={onDismiss} className="text-base-content/30 hover:text-base-content/60 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/* ─── Live Profile Preview Card ─── */
const PreviewCard = ({ user: u, firstName, lastName, photoUrl, about, skills, age, gender }) => {
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "Your Name";
  const previewUser = { ...u, firstName, lastName, photoUrl };
  const CHIP_COLORS = [
    "bg-violet-500/15 text-violet-400 border-violet-500/20",
    "bg-blue-500/15 text-blue-400 border-blue-500/20",
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    "bg-rose-500/15 text-rose-400 border-rose-500/20",
    "bg-amber-500/15 text-amber-400 border-amber-500/20",
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-base-content/10 bg-base-300 shadow-xl w-full max-w-64 mx-auto">
      {/* Photo area */}
      <div className="relative bg-base-200" style={{ aspectRatio: "3/3.2" }}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(145deg,#2d1b69 0%,#1e1b4b 40%,#312e81 70%,#4c1d95 100%)" }}>
            <Avatar user={previewUser} className="w-20 h-20 rounded-full" textClassName="text-2xl" />
          </div>
        )}
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-base-300 via-base-300/20 to-transparent" />
        {/* name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <p className="font-bold text-base-content text-base leading-tight">{displayName}</p>
          {(age || gender) && (
            <p className="text-xs text-base-content/55 mt-0.5">
              {[age, gender && (gender === "male" ? "He/Him" : gender === "female" ? "She/Her" : "They/Them")].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 border-t border-base-content/8">
        {about ? (
          <p className="text-xs text-base-content/60 leading-relaxed line-clamp-3">{about}</p>
        ) : (
          <p className="text-xs text-base-content/25 italic">No bio yet…</p>
        )}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {skills.slice(0, 5).map((s, i) => (
              <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${CHIP_COLORS[i % CHIP_COLORS.length]}`}>{s}</span>
            ))}
            {skills.length > 5 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-base-content/10 text-base-content/40">+{skills.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════ Main ══════════════ */
const Profile = () => {
  const user = useSelector((s) => s.user);
  const dispatch = useDispatch();

  const initial = useMemo(() => ({
    firstName: user?.firstName || "",
    lastName:  user?.lastName  || "",
    age:       user?.age ? String(user.age) : "",
    gender:    user?.gender || "",
    photoUrl:  user?.photo || user?.photoUrl || "",
    about:     user?.about || "",
    skills:    user?.skills || [],
  }), [user]);

  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName,  setLastName]  = useState(initial.lastName);
  const [age,       setAge]       = useState(initial.age);
  const [gender,    setGender]    = useState(initial.gender);
  const [photoUrl,  setPhotoUrl]  = useState(initial.photoUrl);
  const [about,     setAbout]     = useState(initial.about);
  const [skills,    setSkills]    = useState(initial.skills);

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const toastRef = useRef(null);

  /* ── Image upload state ── */
  const [localFile,       setLocalFile]       = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [uploadState,     setUploadState]     = useState("idle"); // "idle"|"uploading"|"done"|"error"
  const [uploadProgress,  setUploadProgress]  = useState(0);
  const [uploadError,     setUploadError]     = useState(null);
  const [isDragOver,      setIsDragOver]      = useState(false);
  const [showUploadZone,  setShowUploadZone]  = useState(!initial.photoUrl); // show zone only when no photo saved
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFirstName(initial.firstName);
    setLastName(initial.lastName);
    setAge(initial.age);
    setGender(initial.gender);
    setPhotoUrl(initial.photoUrl);
    setAbout(initial.about);
    setSkills(initial.skills);
  }, [initial]);

  /* Revoke blob URL on unmount to prevent memory leak */
  useEffect(() => {
    return () => { if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl); };
  }, [localPreviewUrl]);

  const isDirty =
    firstName !== initial.firstName || lastName !== initial.lastName ||
    age !== initial.age || gender !== initial.gender ||
    photoUrl !== initial.photoUrl || about !== initial.about ||
    skills.join(",") !== initial.skills.join(",") ||
    localFile !== null;

  /* ── File validation & selection ── */
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

  const clearLocalFile = (keepZone = false) => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalFile(null);
    setLocalPreviewUrl(null);
    setUploadState("idle");
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!keepZone) setShowUploadZone(!photoUrl); // collapse zone if a photo is already saved
  };

  /* ── Cloudinary upload via XHR (for progress events) ── */
  const uploadToCloudinary = (file) => {
    const cloud  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    console.log("[Cloudinary] cloud:", cloud, "| preset:", preset);
    if (!cloud || !preset) {
      setUploadState("error");
      setUploadError("Cloudinary config missing — restart the dev server after saving .env");
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
      xhr.addEventListener("abort", () => {
        setUploadState("idle");
        reject(new Error("Upload cancelled."));
      });
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloud}/image/upload`);
      xhr.send(formData);
    });
  };

  const showToast = (next, ms = 3000) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast(next);
    if (ms) toastRef.current = setTimeout(() => setToast(null), ms);
  };

  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "Required";
    else if (firstName.trim().length < 2) e.firstName = "Min 2 characters";
    if (!lastName.trim()) e.lastName = "Required";
    else if (lastName.trim().length < 2) e.lastName = "Min 2 characters";
    if (age) {
      const n = Number(age);
      if (!Number.isInteger(n) || n < 18 || n > 100) e.age = "Must be 18–100";
    }
    if (about.length > ABOUT_MAX) e.about = `Max ${ABOUT_MAX} chars`;
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      setLoading(true);
      let finalPhotoUrl = photoUrl;

      /* Upload local file to Cloudinary first (if a file was picked and not yet uploaded) */
      if (localFile && uploadState !== "done") {
        try {
          finalPhotoUrl = await uploadToCloudinary(localFile);
          setPhotoUrl(finalPhotoUrl);
        } catch (uploadErr) {
          setUploadError(uploadErr.message || "Upload failed. Please try again.");
          showToast({ type: "error", message: "Image upload failed. Please try again." }, 4000);
          setLoading(false);
          return;
        }
      }

      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        { firstName: firstName.trim(), lastName: lastName.trim(), age: age ? Number(age) : undefined, gender, photo: finalPhotoUrl || undefined, about, skills },
        { withCredentials: true }
      );
      const payload = res.data?.user ?? res.data?.data ?? res.data;
      dispatch(addUser(payload));
      /* Clear upload state after successful save */
      setLocalFile(null);
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
      setUploadState("idle");
      setShowUploadZone(false); // photo saved — collapse to compact state
      showToast({ type: "success", message: "Profile saved successfully!" });
    } catch (err) {
      showToast({ type: "error", message: err.response?.data?.message || "Failed to save profile" }, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFirstName(initial.firstName); setLastName(initial.lastName);
    setAge(initial.age); setGender(initial.gender);
    setPhotoUrl(initial.photoUrl); setAbout(initial.about); // initial.photoUrl already reads user.photo via useMemo
    setSkills(initial.skills); setFieldErrors({});
    clearLocalFile(true); // keepZone=true so we compute based on initial.photoUrl below
    setShowUploadZone(!initial.photoUrl);
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .fade-up { animation: fadeUp 0.3s ease both }
        @media (prefers-reduced-motion:reduce) { .fade-up { animation:none !important } }
      `}</style>

      <div className="min-h-[calc(100vh-64px)] bg-base-100 pb-20 sm:pb-0">

        {/* ── Page hero ── */}
        <div
          className="border-b border-base-content/8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.06) 0%,transparent 50%,rgba(139,92,246,0.04) 100%)" }}
        >
          {/* subtle grid */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="relative max-w-6xl mx-auto px-5 py-8 sm:py-10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/8 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] text-primary font-semibold tracking-wide uppercase">Profile Settings</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
                Your <span style={{ background: "linear-gradient(135deg,#818cf8,#c084fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Profile</span>
              </h1>
              <p className="text-sm text-base-content/45 mt-1">This is how other developers see you on devHive.</p>
            </div>
            {isDirty && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/25 rounded-full px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved changes
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className="max-w-6xl mx-auto px-5 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── LEFT: Live preview ── */}
            <div className="lg:w-72 shrink-0 lg:sticky lg:top-6 flex flex-col gap-4 order-last lg:order-first">
              {/* Preview label — tappable on mobile to expand/collapse */}
              <button
                type="button"
                onClick={() => setPreviewOpen((o) => !o)}
                className="flex items-center gap-2 w-full lg:cursor-default"
              >
                <span className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">Live Preview</span>
                <div className="flex-1 h-px bg-base-content/8" />
                {/* chevron — mobile only */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-base-content/35 lg:hidden transition-transform duration-200 ${previewOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Preview content — hidden on mobile until tapped; always visible on lg+ */}
              <div className={`flex flex-col gap-4 ${previewOpen ? "flex" : "hidden"} lg:flex lg:flex-col`}>
                <PreviewCard
                  user={user}
                  firstName={firstName}
                  lastName={lastName}
                  photoUrl={localPreviewUrl ?? photoUrl}
                  about={about}
                  skills={skills}
                  age={age}
                  gender={gender}
                />
                {/* Stat pills */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-base-content/10 bg-base-300 px-3 py-2.5 text-center">
                    <p className="text-lg font-black text-base-content">{skills.length}</p>
                    <p className="text-[10px] text-base-content/40 mt-0.5">Skills</p>
                  </div>
                  <div className="rounded-xl border border-base-content/10 bg-base-300 px-3 py-2.5 text-center">
                    <p className="text-lg font-black text-base-content">{about.length}</p>
                    <p className="text-[10px] text-base-content/40 mt-0.5">Bio chars</p>
                  </div>
                </div>
                {/* Completeness bar */}
                {(() => {
                  const fields = [firstName, lastName, age, gender, localPreviewUrl ?? photoUrl, about, skills.length > 0 ? "y" : ""];
                  const filled = fields.filter(Boolean).length;
                  const pct = Math.round((filled / fields.length) * 100);
                  return (
                    <div className="rounded-xl border border-base-content/10 bg-base-300 px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-base-content/50">Profile complete</span>
                        <span className="text-xs font-bold text-primary">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-base-content/8 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6366f1,#c084fc)" }}
                        />
                      </div>
                      {pct < 100 && (
                        <p className="text-[10px] text-base-content/35 mt-1.5">Fill all fields to complete your profile</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── RIGHT: Form ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">

              {/* ── Photo section ── */}
              <div className="rounded-2xl border border-base-content/10 bg-base-300 overflow-hidden">
                <div className="px-5 py-4 border-b border-base-content/8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))", border: "1px solid rgba(99,102,241,0.25)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-base-content">Profile Photo</h2>
                    <p className="text-[11px] text-base-content/40">Shown on your profile, matches, and in chat</p>
                  </div>
                </div>

                <div className="px-4 sm:px-5 py-5 flex flex-col gap-4">

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
                  />

                  {/* ── Mobile: stacked layout / Desktop: side-by-side ── */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">

                    {/* Thumbnail — clickable on mobile to trigger file picker */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadState === "uploading"}
                      className="relative shrink-0 group focus:outline-none disabled:cursor-not-allowed"
                      aria-label="Change profile photo"
                    >
                      <Avatar
                        user={{ ...user, firstName, lastName, photoUrl: localPreviewUrl ?? photoUrl }}
                        className="w-20 h-20 rounded-2xl ring-2 ring-primary/20 ring-offset-2 ring-offset-base-300 transition-all group-hover:ring-primary/50"
                        textClassName="text-xl"
                      />
                      {/* camera overlay on hover / always visible on mobile */}
                      <div className="absolute inset-0 rounded-2xl bg-base-300/0 group-hover:bg-base-300/60 sm:group-hover:bg-base-300/60 transition-all flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      {/* success badge */}
                      {(localPreviewUrl ?? photoUrl) && uploadState !== "uploading" && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-base-300 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-success-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {/* upload spinner overlay */}
                      {uploadState === "uploading" && (
                        <div className="absolute inset-0 rounded-2xl bg-base-300/70 flex items-center justify-center">
                          <svg className="w-6 h-6 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Right side — compact state OR upload zone */}
                    <div className="flex-1 w-full min-w-0 flex flex-col gap-2.5">

                      {/* ── Compact state: photo already saved, no file selected ── */}
                      {!showUploadZone && !localFile && (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-base-content/10 bg-base-200/50 px-4 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-base-content leading-tight">Photo saved</p>
                              <p className="text-[11px] text-base-content/40 mt-0.5 truncate">Your profile photo is set</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setShowUploadZone(true)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 active:scale-95 transition-all"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => { setPhotoUrl(""); setShowUploadZone(true); }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-base-content/40 hover:text-error hover:bg-error/10 active:scale-95 transition-all"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Upload zone: no photo saved, or user clicked "Change" ── */}
                      {(showUploadZone || localFile) && (
                        <>
                          {/* Cancel button — only shown when user opened zone to change existing photo */}
                          {showUploadZone && photoUrl && !localFile && (
                            <button
                              type="button"
                              onClick={() => { setShowUploadZone(false); setUploadError(null); }}
                              className="self-end text-[11px] text-base-content/40 hover:text-base-content/70 transition-colors"
                            >
                              ✕ Cancel
                            </button>
                          )}

                          {!localFile ? (
                            /* Drag & drop zone — tap-friendly on mobile */
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
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isDragOver ? "text-primary" : "text-base-content/40"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                              <div className="sm:text-center">
                                <p className={`text-sm font-semibold transition-colors leading-snug ${isDragOver ? "text-primary" : "text-base-content/60"}`}>
                                  {isDragOver ? "Drop image here" : <><span className="sm:hidden">Tap to choose a photo</span><span className="hidden sm:inline">Click or drag & drop</span></>}
                                </p>
                                <p className="text-[11px] text-base-content/35 mt-0.5">JPG, PNG, WebP or GIF · max 5 MB</p>
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
                                <p className="text-sm font-medium text-base-content truncate">{localFile.name}</p>
                                <p className="text-[11px] text-base-content/40 mt-0.5">{(localFile.size / 1024).toFixed(0)} KB · {localFile.type.split("/")[1].toUpperCase()}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => clearLocalFile()}
                                disabled={uploadState === "uploading"}
                                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base-content/35 hover:text-error hover:bg-error/10 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Remove selected image"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}

                          {/* Upload progress */}
                          {uploadState === "uploading" && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-base-content/50 flex items-center gap-1.5">
                                  <span className="w-3 h-3 border-2 border-primary/40 border-t-primary rounded-full animate-spin shrink-0" />
                                  Uploading to cloud…
                                </span>
                                <span className="text-[11px] font-bold text-primary tabular-nums">{uploadProgress}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-base-content/8 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%`, background: "linear-gradient(90deg,#6366f1,#c084fc)" }} />
                              </div>
                            </div>
                          )}

                          {/* Upload done */}
                          {uploadState === "done" && (
                            <div className="flex items-center gap-1.5 text-[11px] text-success font-medium">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              Uploaded — click Save to apply
                            </div>
                          )}

                          {/* Upload error */}
                          {uploadError && (
                            <div className="flex items-start gap-1.5 text-[11px] text-error">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {uploadError}
                            </div>
                          )}
                        </>
                      )}

                    </div>
                  </div>
                </div>
              </div>

              {/* ── Basic info ── */}
              <div className="rounded-2xl border border-base-content/10 bg-base-300 overflow-hidden">
                <div className="px-5 py-4 border-b border-base-content/8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.2),rgba(99,102,241,0.2))", border: "1px solid rgba(59,130,246,0.25)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-base-content">Basic Info</h2>
                    <p className="text-[11px] text-base-content/40">Your name and photo appear on Discover cards</p>
                  </div>
                </div>
                <div className="px-5 py-5 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatInput id="firstName" label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={fieldErrors.firstName} autoComplete="given-name" />
                    <FloatInput id="lastName" label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} error={fieldErrors.lastName} autoComplete="family-name" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatInput id="age" label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} error={fieldErrors.age} hint="Must be 18–100" min={18} max={100} />
                    <FloatSelect id="gender" label="Gender" value={gender} onChange={(e) => setGender(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* ── About ── */}
              <div className="rounded-2xl border border-base-content/10 bg-base-300 overflow-hidden">
                <div className="px-5 py-4 border-b border-base-content/8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.2))", border: "1px solid rgba(16,185,129,0.25)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-base-content">About</h2>
                    <p className="text-[11px] text-base-content/40">Share what you build and what excites you</p>
                  </div>
                </div>
                <div className="px-5 py-5">
                  <div className="relative">
                    <textarea
                      rows={4}
                      maxLength={ABOUT_MAX + 40}
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="e.g. Full-stack engineer building dev tools. Love Rust, Go, and weekend side projects..."
                      className={`w-full rounded-xl border px-4 py-3 text-sm bg-base-200/60 text-base-content placeholder:text-base-content/25 resize-none leading-relaxed focus:outline-none focus:ring-2 transition-all
                        ${fieldErrors.about ? "border-error/60 focus:border-error/80 focus:ring-error/15" : "border-base-content/12 focus:border-primary/60 focus:ring-primary/15"}`}
                    />
                    <div className={`flex items-center justify-between mt-1.5 ${about.length > ABOUT_MAX ? "text-error" : "text-base-content/35"}`}>
                      {fieldErrors.about
                        ? <span className="text-[10px] text-error">{fieldErrors.about}</span>
                        : <span className="text-[10px]">Keep it concise and authentic</span>
                      }
                      <span className="text-[10px] font-medium tabular-nums">{about.length}/{ABOUT_MAX}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Skills ── */}
              <div className="rounded-2xl border border-base-content/10 bg-base-300 overflow-hidden">
                <div className="px-5 py-4 border-b border-base-content/8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(217,119,6,0.2))", border: "1px solid rgba(245,158,11,0.25)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-bold text-base-content">Skills</h2>
                    <p className="text-[11px] text-base-content/40">Add up to 20 — press Enter or comma after each</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${skills.length >= 20 ? "bg-error/15 text-error" : "bg-base-content/8 text-base-content/40"}`}>
                    {skills.length}/20
                  </span>
                </div>
                <div className="px-5 py-5">
                  <SkillsEditor value={skills} onChange={(next) => setSkills(next.slice(0, 20))} />
                  {skills.length >= 20 && (
                    <p className="mt-2 text-[11px] text-amber-400">Maximum 20 skills reached — remove one to add another.</p>
                  )}
                </div>
              </div>

              {/* ── Account (read-only) ── */}
              <div className="rounded-2xl border border-base-content/10 bg-base-300 overflow-hidden">
                <div className="px-5 py-4 border-b border-base-content/8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(236,72,153,0.2),rgba(244,114,182,0.2))", border: "1px solid rgba(236,72,153,0.25)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-base-content">Account</h2>
                    <p className="text-[11px] text-base-content/40">Read-only — contact support to change email</p>
                  </div>
                </div>
                <div className="px-5 py-5">
                  <FloatInput id="email" label="Email address" value={user?.emailId || ""} readOnly />
                </div>
              </div>

              {/* ── Action bar ── */}
              <div className="rounded-2xl border border-base-content/10 bg-base-300 px-5 py-4 flex items-center justify-between gap-3">
                <p className="text-xs text-base-content/35 hidden sm:block">
                  {isDirty ? "You have unsaved changes." : "All changes saved."}
                </p>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!isDirty || loading}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-base-content/55 hover:text-base-content hover:bg-base-content/6 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isDirty || loading}
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: isDirty ? "0 4px 14px rgba(99,102,241,0.35)" : "none" }}
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
};

export default Profile;
