import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

const Profile = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [about, setAbout] = useState(user?.about || "");
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const handleEdit = async () => {
    setError("");
    try {
      setLoading(true);
      const response = await axios.get(BASE_URL + "/api/profile/view", { withCredentials: true });
      const data = response.data.user;
      dispatch(addUser(data));
      setFirstName(data?.firstName || "");
      setLastName(data?.lastName || "");
      setAge(data?.age || "");
      setGender(data?.gender || "");
      setPhotoUrl(data?.photoUrl || "");
      setAbout(data?.about || "");
      setSkills(data?.skills?.join(", ") || "");
      setEditMode(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setAge(user?.age || "");
    setGender(user?.gender || "");
    setPhotoUrl(user?.photoUrl || "");
    setAbout(user?.about || "");
    setSkills(user?.skills?.join(", ") || "");
    setError("");
    setEditMode(false);
  };

  const validate = () => {
    if (!firstName.trim() || !lastName.trim()) return "Name cannot be empty";
    if (firstName.trim().length < 2 || lastName.trim().length < 2) return "Name must be at least 2 characters";
    if (age) {
      const ageNum = Number(age);
      if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 100) return "Age must be between 18 and 100";
    }
    if (photoUrl) { try { new URL(photoUrl); } catch { return "Please enter a valid photo URL"; } }
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    try {
      setLoading(true);
      const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      const response = await axios.patch(
        BASE_URL + "/api/profile/edit",
        { firstName, lastName, age: age ? Number(age) : undefined, gender, photoUrl: photoUrl || undefined, about, skills: skillsArray },
        { withCredentials: true }
      );
      dispatch(addUser(response.data));
      setEditMode(false);
      setToast("Profile updated successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input w-full rounded-xl border border-base-content/20 focus:border-primary focus:outline-none bg-base-200 px-4 py-3 text-sm";
  const labelClass = "text-sm font-medium text-base-content/70";

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8">

        {!editMode ? (
          /* ── View Mode ── */
          <div className="bg-base-300 rounded-3xl overflow-hidden border border-base-content/10 shadow-lg">

            {/* Cover banner */}
            <div className="h-36 bg-linear-to-br from-primary/30 via-secondary/20 to-accent/20 relative">
              <button
                className="absolute top-3 right-3 btn btn-sm rounded-xl bg-base-300/80 backdrop-blur-sm border border-base-content/10 hover:bg-base-300 gap-1.5"
                onClick={handleEdit}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </>
                )}
              </button>
            </div>

            {/* Avatar overlapping cover */}
            <div className="px-6 pb-6">
              <div className="-mt-14 mb-4 flex items-end justify-between">
                <img
                  src={user?.photoUrl || fallbackPhoto}
                  alt={user?.firstName}
                  onError={(e) => { e.target.src = fallbackPhoto; }}
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-base-300 shadow-xl"
                />
              </div>

              {/* Info */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-base-content/60">
                  {user?.age && <span>{user.age} yrs</span>}
                  {user?.age && user?.gender && <span>·</span>}
                  {user?.gender && <span className="capitalize">{user.gender}</span>}
                </div>
                {user?.emailId && (
                  <p className="text-sm text-base-content/50 mt-0.5 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {user.emailId}
                  </p>
                )}
              </div>

              {/* About */}
              {user?.about && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-base-content/50 uppercase tracking-wider mb-1.5">About</p>
                  <p className="text-base-content/80 text-sm leading-relaxed">{user.about}</p>
                </div>
              )}

              {/* Skills */}
              {user?.skills?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-base-content/50 uppercase tracking-wider mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <span key={skill} className="badge badge-primary badge-outline rounded-full px-3">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-error text-sm mt-4">{error}</p>}
            </div>
          </div>

        ) : (
          /* ── Edit Mode ── */
          <div className="bg-base-300 rounded-3xl border border-base-content/10 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-base-content/10 flex items-center gap-3">
              <img
                src={photoUrl || fallbackPhoto}
                onError={(e) => { e.target.src = fallbackPhoto; }}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                alt=""
              />
              <div>
                <h2 className="font-bold text-lg">Edit Profile</h2>
                <p className="text-sm text-base-content/50">Update your public information</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 flex flex-col gap-4">
              {error && (
                <div className="alert alert-error py-3 text-sm rounded-xl">
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">Basic Info</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>First Name</label>
                  <input type="text" className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Last Name</label>
                  <input type="text" className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Age</label>
                  <input type="number" className={inputClass} min={18} max={100} value={age} onChange={(e) => setAge(e.target.value)} />
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

              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mt-1">Photo</p>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Photo URL <span className="font-normal text-base-content/40">(optional)</span></label>
                <div className="flex items-center gap-3">
                  <img
                    src={photoUrl || fallbackPhoto}
                    onError={(e) => { e.target.src = fallbackPhoto; }}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                    alt=""
                  />
                  <input type="url" className={inputClass} placeholder="https://example.com/photo.jpg" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
                </div>
              </div>

              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mt-1">Details</p>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>About <span className="font-normal text-base-content/40">(optional)</span></label>
                <textarea
                  className="textarea w-full rounded-xl border border-base-content/20 focus:border-primary focus:outline-none bg-base-200 px-4 py-3 text-sm resize-none"
                  rows={3}
                  placeholder="Tell other developers about yourself..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Skills <span className="font-normal text-base-content/40">(comma separated)</span></label>
                <input type="text" className={inputClass} placeholder="React, Node.js, Python..." value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>

              <div className="flex gap-3 mt-2 pt-4 border-t border-base-content/10">
                <button
                  type="button"
                  className="btn btn-ghost flex-1 rounded-xl"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                  disabled={loading}
                >
                  {loading ? <span className="loading loading-spinner loading-sm" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {toast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success rounded-2xl shadow-xl">
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

export default Profile;
