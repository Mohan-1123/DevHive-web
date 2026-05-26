import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../utils/userSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import Avatar from "./Avatar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ══════════════ Menu icons ══════════════ */

const Icon = {
  user: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  compass: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.5 9.5L13 13l-3.5 1.5L11 11l3.5-1.5z" />
    </svg>
  ),
  users: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  bolt: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  crown: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M2.5 8.5L6 12l3.5-5 2.5 4 2.5-4 3.5 5 3.5-3.5L20 18H4L2.5 8.5zM4.5 20h15v1.5h-15z" />
    </svg>
  ),
  logout: (p) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

const MenuItem = ({ to, icon, label, onClick, danger, trailing, close }) => {
  const base = "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-colors";
  const color = danger
    ? "text-error hover:bg-error/10"
    : "text-base-content/80 hover:text-base-content hover:bg-base-content/5";
  const content = (
    <>
      <span className={`shrink-0 ${danger ? "text-error/90" : "text-base-content/55"}`}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </>
  );
  if (to) {
    return <Link to={to} onClick={close} className={`${base} ${color}`}>{content}</Link>;
  }
  return <button type="button" onClick={() => { close?.(); onClick?.(); }} className={`${base} ${color} text-left`}>{content}</button>;
};

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) { setPendingCount(0); return; }
    let cancelled = false;
    const fetchCount = () => {
      axios
        .get(BASE_URL + "/api/user/requests/received", { withCredentials: true })
        .then((res) => { if (!cancelled) setPendingCount((res.data.data || []).length); })
        .catch(() => {});
    };
    fetchCount();
    window.addEventListener("requests:changed", fetchCount);
    return () => {
      cancelled = true;
      window.removeEventListener("requests:changed", fetchCount);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/api/auth/logout", {}, { withCredentials: true });
    } finally {
      dispatch(removeUser());
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, badge }) => (
    <Link
      to={to}
      className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
        ${isActive(to)
          ? "text-primary bg-primary/10"
          : "text-base-content/70 hover:text-base-content hover:bg-base-content/5"
        }`}
    >
      <span className="inline-flex items-center gap-1.5">
        {children}
        {badge > 0 && (
          <span className="text-[10px] font-bold bg-primary text-primary-content rounded-full min-w-4 h-4 px-1 inline-flex items-center justify-center leading-none">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      {isActive(to) && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
      )}
    </Link>
  );

  return (
    <>
      {/* Desktop + tablet navbar */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-base-300/80 border-b border-base-content/10 shadow-sm px-4 hidden sm:flex items-center h-16">
        {/* Logo */}
        <div className="flex-1">
          <Link
            to={user ? "/discover" : "/"}
            className="text-xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary tracking-tight"
          >
            devHive
          </Link>
        </div>

        {/* Nav links */}
        {user && (
          <div className="flex items-center gap-1">
            <NavLink to="/discover">Discover</NavLink>
            <NavLink to="/connections" badge={pendingCount}>Connections</NavLink>
          </div>
        )}

        {/* Right side */}
        <div className="flex-1 flex justify-end items-center gap-3">
          {user ? (
            <>
              {/* Upgrade button — only for non-premium users */}
              {!user.isPremium && (
                <Link
                  to="/premium"
                  className="btn btn-sm rounded-xl border-0 gap-1.5 text-white font-semibold bg-linear-to-r from-amber-400 to-orange-500 shadow-sm shadow-orange-400/30 hover:-translate-y-0.5 hover:shadow-orange-400/50 transition-all"
                >
                  ⚡ Upgrade
                </Link>
              )}

              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle p-0 w-10 h-10 relative">
                  <Avatar
                    user={user}
                    className="w-10 h-10 rounded-full ring-2 ring-primary/30 ring-offset-1 ring-offset-base-300"
                    textClassName="text-sm"
                  />
                  {user.isPremium ? (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center border-2 border-base-300">
                      <Icon.crown className="w-2 h-2 text-white" />
                    </span>
                  ) : (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-300" />
                  )}
                </div>
                <div
                  tabIndex="-1"
                  className="dropdown-content bg-base-100 rounded-2xl z-50 mt-3 w-64 shadow-2xl border border-base-content/10 overflow-hidden"
                >
                  {/* Header */}
                  <Link to="/profile" className="flex items-center gap-3 p-4 hover:bg-base-content/5 transition-colors">
                    <Avatar
                      user={user}
                      className="w-11 h-11 rounded-full ring-2 ring-primary/20"
                      textClassName="text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm leading-tight truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-base-content/45 truncate mt-0.5" title={user.emailId}>{user.emailId}</p>
                    </div>
                  </Link>

                  {/* Premium strip — only when premium */}
                  {user.isPremium && (
                    <div className="mx-3 mb-2 px-3 py-2 rounded-xl flex items-center gap-2 bg-linear-to-r from-amber-400/15 to-orange-500/15 border border-amber-400/25">
                      <Icon.crown className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-500">Gold Member</span>
                    </div>
                  )}

                  <div className="h-px bg-base-content/8 mx-3" />

                  {/* Nav items */}
                  <div className="p-2 flex flex-col gap-0.5">
                    <MenuItem to="/profile"     icon={<Icon.user    className="w-4 h-4" />} label="Profile" />
                    <MenuItem to="/discover"    icon={<Icon.compass className="w-4 h-4" />} label="Discover" />
                    <MenuItem to="/connections" icon={<Icon.users   className="w-4 h-4" />} label="Connections" />
                    {!user.isPremium && (
                      <MenuItem
                        to="/premium"
                        icon={<Icon.bolt className="w-4 h-4" />}
                        label="Upgrade to Premium"
                        trailing={<span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/25 rounded-full px-1.5 py-0.5">PRO</span>}
                      />
                    )}
                  </div>

                  <div className="h-px bg-base-content/8 mx-3" />

                  <div className="p-2">
                    <MenuItem icon={<Icon.logout className="w-4 h-4" />} label="Log out" danger onClick={handleLogout} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm rounded-xl">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm rounded-xl shadow-sm shadow-primary/20">Sign Up</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="sm:hidden sticky top-0 z-50 backdrop-blur-md bg-base-300/80 border-b border-base-content/10 px-4 flex items-center justify-between h-14">
        <Link
          to={user ? "/discover" : "/"}
          className="text-lg font-extrabold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary"
        >
          devHive
        </Link>
        {!user && (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost btn-xs rounded-lg">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-xs rounded-lg">Sign Up</Link>
          </div>
        )}
        {user && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle p-0 w-9 h-9 relative">
              <Avatar
                user={user}
                className="w-9 h-9 rounded-full ring-2 ring-primary/30"
                textClassName="text-xs"
              />
              {user.isPremium && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center border-2 border-base-300">
                  <Icon.crown className="w-1.5 h-1.5 text-white" />
                </span>
              )}
            </div>
            <div
              tabIndex="-1"
              className="dropdown-content bg-base-100 rounded-2xl z-50 mt-2 w-60 shadow-2xl border border-base-content/10 overflow-hidden"
            >
              <Link to="/profile" className="flex items-center gap-3 p-3.5 hover:bg-base-content/5 transition-colors">
                <Avatar
                  user={user}
                  className="w-10 h-10 rounded-full ring-2 ring-primary/20"
                  textClassName="text-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm leading-tight truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-base-content/45 truncate mt-0.5">{user.emailId}</p>
                </div>
              </Link>
              {user.isPremium && (
                <div className="mx-3 mb-2 px-3 py-2 rounded-xl flex items-center gap-2 bg-linear-to-r from-amber-400/15 to-orange-500/15 border border-amber-400/25">
                  <Icon.crown className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-500">Gold Member</span>
                </div>
              )}
              <div className="h-px bg-base-content/8 mx-3" />
              <div className="p-2 flex flex-col gap-0.5">
                <MenuItem to="/profile"     icon={<Icon.user    className="w-4 h-4" />} label="Profile" />
                <MenuItem to="/discover"    icon={<Icon.compass className="w-4 h-4" />} label="Discover" />
                <MenuItem to="/connections" icon={<Icon.users   className="w-4 h-4" />} label="Connections" />
                {!user.isPremium && (
                  <MenuItem
                    to="/premium"
                    icon={<Icon.bolt className="w-4 h-4" />}
                    label="Upgrade to Premium"
                    trailing={<span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/25 rounded-full px-1.5 py-0.5">PRO</span>}
                  />
                )}
              </div>
              <div className="h-px bg-base-content/8 mx-3" />
              <div className="p-2">
                <MenuItem icon={<Icon.logout className="w-4 h-4" />} label="Log out" danger onClick={handleLogout} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom nav (when logged in) */}
      {user && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-300/90 backdrop-blur-md border-t border-base-content/10 flex items-center justify-around px-2 py-2 safe-area-bottom">
          <Link to="/discover" className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${isActive("/discover") ? "text-primary" : "text-base-content/50"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/discover") ? 2.5 : 1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[10px] font-medium">Discover</span>
          </Link>
          <Link to="/connections" className={`relative flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${isActive("/connections") ? "text-primary" : "text-base-content/50"}`}>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/connections") ? 2.5 : 1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 text-[9px] font-bold bg-primary text-primary-content rounded-full flex items-center justify-center leading-none border-2 border-base-300">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Connections</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${isActive("/profile") ? "text-primary" : "text-base-content/50"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/profile") ? 2.5 : 1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
          <Link to="/premium" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${isActive("/premium") ? "text-amber-500" : "text-base-content/50"}`}>
            <span className="text-xl leading-none">{user.isPremium ? "👑" : "⚡"}</span>
            <span className="text-[10px] font-medium">{user.isPremium ? "Gold" : "Upgrade"}</span>
          </Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
