import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      setError(err.response?.data?.message || "Failed to load profile. Please try again.");
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
    if (firstName.trim().length < 2 || lastName.trim().length < 2)
      return "Name must be at least 2 characters";
    if (age) {
      const ageNum = Number(age);
      if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 100)
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

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

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
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

  return (
    <>
      <div className="flex items-start justify-center min-h-[80vh] px-4 py-8">
        <div className="card bg-base-300 w-full max-w-2xl shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl justify-center mb-4">My Profile</h2>

            {!editMode ? (
              /* ── View Mode ── */
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="avatar shrink-0">
                  <div className="w-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={user?.photoUrl || fallbackPhoto}
                      alt={`${user?.firstName}'s photo`}
                      onError={(e) => { e.target.src = fallbackPhoto; }}
                    />
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-xl font-bold">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1 text-sm text-base-content/70">
                    {user?.age && <span>{user.age} yrs</span>}
                    {user?.age && user?.gender && <span>·</span>}
                    {user?.gender && <span className="capitalize">{user.gender}</span>}
                  </div>
                  <p className="text-base-content/60 text-sm mt-1">{user?.emailId}</p>

                  {user?.about && (
                    <p className="mt-3 text-base-content/80">{user.about}</p>
                  )}

                  {user?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {user.skills.map((skill) => (
                        <span key={skill} className="badge badge-primary badge-outline">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {error && (
                    <p className="text-error text-sm mt-3">{error}</p>
                  )}
                  <button
                    className="btn btn-primary mt-6 w-full sm:w-auto"
                    onClick={handleEdit}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Edit Profile"}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Edit Mode ── */
              <form onSubmit={handleSave}>
                {error && (
                  <p className="text-error text-sm text-center mb-2">{error}</p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <fieldset className="fieldset flex-1">
                    <legend className="fieldset-legend">First Name</legend>
                    <input
                      type="text"
                      className="input w-full"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="fieldset flex-1">
                    <legend className="fieldset-legend">Last Name</legend>
                    <input
                      type="text"
                      className="input w-full"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </fieldset>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <fieldset className="fieldset flex-1">
                    <legend className="fieldset-legend">Age</legend>
                    <input
                      type="number"
                      className="input w-full"
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
                          src={photoUrl || fallbackPhoto}
                          alt="Preview"
                          onError={(e) => { e.target.src = fallbackPhoto; }}
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

                <fieldset className="fieldset">
                  <legend className="fieldset-legend">About <span className="text-base-content/50 font-normal">(optional)</span></legend>
                  <textarea
                    className="textarea w-full"
                    rows={3}
                    placeholder="Tell other developers about yourself..."
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                  />
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Skills <span className="text-base-content/50 font-normal">(comma separated)</span></legend>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="React, Node.js, Python..."
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </fieldset>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost flex-1"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
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

export default Profile;
