import { useState } from "react";

/* Deterministic initials + gradient avatar.
   Same user always gets the same color; no photo = initials fallback. */

const getInitials = (user) => {
  const a = (user?.firstName || "").trim()[0];
  const b = (user?.lastName  || "").trim()[0];
  return `${a || ""}${b || ""}`.toUpperCase() || "?";
};

const getGradient = (user) => {
  const seed = (user?._id || user?.emailId || user?.firstName || "?").toString();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const gradients = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#8b5cf6,#ec4899)",
    "linear-gradient(135deg,#06b6d4,#3b82f6)",
    "linear-gradient(135deg,#10b981,#06b6d4)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
    "linear-gradient(135deg,#3b82f6,#8b5cf6)",
  ];
  return gradients[Math.abs(hash) % gradients.length];
};

/*
  `user` — the object whose avatar we want to show
  `photoOverride` — a photo to render instead of user.photo (for live preview)
  `className` — sizing + ring + offset classes
  `textClassName` — font sizing for the initials
*/
const Avatar = ({ user, photoOverride, className = "", textClassName = "text-sm" }) => {
  const [broken, setBroken] = useState(false);
  const photo = photoOverride !== undefined ? photoOverride : (user?.photo || user?.photoUrl);
  const hasPhoto = photo && !broken;

  if (hasPhoto) {
    return (
      <img
        src={photo}
        alt={user?.firstName || ""}
        onError={() => setBroken(true)}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center font-bold text-white select-none ${className}`}
      style={{ background: getGradient(user) }}
      aria-label={user?.firstName ? `${user.firstName}'s avatar` : "avatar"}
    >
      <span className={textClassName}>{getInitials(user)}</span>
    </div>
  );
};

export default Avatar;
