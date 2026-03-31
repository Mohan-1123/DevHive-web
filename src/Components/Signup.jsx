import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EyeIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

  const validate = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) return "Please fill in all fields";
    if (firstName.trim().length < 2 || lastName.trim().length < 2) return "Name must be at least 2 characters";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!age || !gender) return "Please fill in all fields";
    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 100) return "Age must be between 18 and 100";
    if (photoUrl) { try { new URL(photoUrl); } catch { return "Please enter a valid photo URL"; } }
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    try {
      setLoading(true);
      const response = await axios.post(
        BASE_URL + "/api/auth/signup",
        { firstName, lastName, emailId: email, PassWord: password, age: Number(age), gender, photoUrl: photoUrl || undefined },
        { withCredentials: true }
      );
      dispatch(addUser(response.data));
      setToast("Account created successfully!");
      setTimeout(() => navigate("/discover"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input w-full rounded-xl border border-base-content/20 focus:border-primary focus:outline-none bg-base-200 px-4 py-3 text-sm";
  const labelClass = "text-sm font-medium text-base-content/80";

  return (
    <>
      <div className="flex min-h-[calc(100vh-64px)]">

        {/* ── Left brand panel ── */}
        <div className="hidden lg:flex flex-1 bg-linear-to-br from-primary to-secondary flex-col items-center justify-center p-12 text-primary-content">
          <div className="max-w-sm text-center">
            <h1 className="text-5xl font-black mb-4">devHive</h1>
            <p className="text-primary-content/80 text-lg leading-relaxed">
              Join thousands of developers discovering meaningful professional connections.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 text-left">
              {[
                { icon: "👤", label: "Set up your profile" },
                { icon: "🔍", label: "Discover developers" },
                { icon: "🤝", label: "Make connections" },
                { icon: "💬", label: "Chat & collaborate" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-primary-content/90">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex items-start justify-center px-4 py-10 bg-base-100 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">devHive</h1>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold">Create your account</h2>
              <p className="text-base-content/50 mt-1 text-sm">Start discovering developers in minutes</p>
            </div>

            {error && (
              <div className="alert alert-error mb-4 py-3 text-sm rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="flex flex-col gap-4">

              {/* Section: Account */}
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mt-1">Account</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>First Name</label>
                  <input type="text" className={inputClass} placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Last Name</label>
                  <input type="text" className={inputClass} placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Email address</label>
                <input type="email" className={inputClass} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} className={inputClass + " pr-12"} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} className={inputClass + " pr-12"} placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>

              {/* Section: Personal */}
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mt-2">Personal</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Age</label>
                  <input type="number" className={inputClass} placeholder="18" min={18} max={100} value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Gender</label>
                  <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="" disabled>Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Section: Profile */}
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mt-2">Profile <span className="normal-case font-normal">(optional)</span></p>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Photo URL</label>
                <div className="flex items-center gap-3">
                  <img
                    src={photoUrl || fallbackPhoto}
                    alt="Preview"
                    onError={(e) => { e.target.src = fallbackPhoto; }}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                  />
                  <input type="url" className={inputClass} placeholder="https://example.com/photo.jpg" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full rounded-xl mt-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : "Create Account"}
              </button>
            </form>

            <p className="text-center mt-5 text-sm text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success rounded-xl shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;
