import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return "Please fill in all fields";
    }
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    if (!age || !gender) {
      return "Please fill in all fields";
    }
    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 100) {
      return "Age must be between 18 and 100";
    }
    if (photoUrl) {
      try {
        new URL(photoUrl);
      } catch {
        return "Please enter a valid photo URL";
      }
    }
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

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

  return (
    <>
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="card bg-base-300 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center">Create Account</h2>
          {error && (
            <p className="text-error text-sm text-center">{error}</p>
          )}
          <form onSubmit={handleSignup}>
            <div className="flex flex-col sm:flex-row gap-3">
              <fieldset className="fieldset flex-1">
                <legend className="fieldset-legend">First Name</legend>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </fieldset>
              <fieldset className="fieldset flex-1">
                <legend className="fieldset-legend">Last Name</legend>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </fieldset>
            </div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email</legend>
              <input
                type="email"
                className="input w-full"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <input
                type="password"
                className="input w-full"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Confirm Password</legend>
              <input
                type="password"
                className="input w-full"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </fieldset>
            <div className="flex flex-col sm:flex-row gap-3">
              <fieldset className="fieldset flex-1">
                <legend className="fieldset-legend">Age</legend>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="Your age"
                  min={18}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </fieldset>
              <fieldset className="fieldset flex-1">
                <legend className="fieldset-legend">Gender</legend>
                <select
                  className="select w-full"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </fieldset>
            </div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Photo URL <span className="text-base-content/50 font-normal">(optional)</span></legend>
              <div className="flex items-center gap-3">
                <div className="avatar shrink-0">
                  <div className="w-12 rounded-full ring ring-base-content/20">
                    <img
                      src={photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                      alt="Profile preview"
                      onError={(e) => {
                        e.target.src = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
                      }}
                    />
                  </div>
                </div>
                <input
                  type="url"
                  className="input w-full"
                  placeholder="https://example.com/photo.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>
            </fieldset>
            <button
              type="submit"
              className="btn btn-primary w-full mt-4"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <p className="text-center mt-2">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
    {toast && (
      <div className="toast toast-top toast-center z-50">
        <div className="alert alert-success">
          <span>{toast}</span>
        </div>
      </div>
    )}
    </>
  );
};

export default Signup;
