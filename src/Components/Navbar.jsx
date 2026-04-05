import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../utils/userSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/api/auth/logout", {}, { withCredentials: true });
    } finally {
      dispatch(removeUser());
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
        ${isActive(to)
          ? "text-primary bg-primary/10"
          : "text-base-content/70 hover:text-base-content hover:bg-base-content/5"
        }`}
    >
      {children}
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
            <NavLink to="/connections">Connections</NavLink>
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
                  <img
                    alt={`${user.firstName}'s avatar`}
                    src={user.photoUrl || fallbackPhoto}
                    onError={(e) => { e.target.src = fallbackPhoto; }}
                    className="w-10 h-10 rounded-full ring-2 ring-primary/30 ring-offset-1 ring-offset-base-300 object-cover"
                  />
                  {user.isPremium ? (
                    <span className="absolute -top-1 -right-1 text-sm leading-none">👑</span>
                  ) : (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-300" />
                  )}
                </div>
                <ul
                  tabIndex="-1"
                  className="menu menu-sm dropdown-content bg-base-100 rounded-2xl z-50 mt-3 w-56 p-2 shadow-xl border border-base-content/10"
                >
                  <li className="px-3 py-2 mb-1">
                    <div className="flex items-center gap-2 pointer-events-none">
                      <img
                        src={user.photoUrl || fallbackPhoto}
                        onError={(e) => { e.target.src = fallbackPhoto; }}
                        className="w-8 h-8 rounded-full object-cover"
                        alt=""
                      />
                      <div>
                        <p className="font-semibold text-sm leading-tight">{user.firstName} {user.lastName}</p>
                        {user.isPremium
                          ? <p className="text-xs text-amber-500 font-medium">👑 Gold Member</p>
                          : <p className="text-xs text-base-content/50 truncate max-w-30">{user.emailId}</p>
                        }
                      </div>
                    </div>
                  </li>
                  <div className="divider my-0" />
                  <li><Link to="/profile" className="rounded-xl">👤 Profile</Link></li>
                  <li><Link to="/discover" className="rounded-xl">🔍 Discover</Link></li>
                  <li><Link to="/connections" className="rounded-xl">🤝 Connections</Link></li>
                  <li>
                    <Link to="/premium" className="rounded-xl">
                      {user.isPremium ? "👑 Gold Member" : "⚡ Go Premium"}
                    </Link>
                  </li>
                  <div className="divider my-0" />
                  <li><a onClick={handleLogout} className="rounded-xl text-error hover:bg-error/10">🚪 Logout</a></li>
                </ul>
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
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle p-0 w-9 h-9">
              <img
                src={user.photoUrl || fallbackPhoto}
                onError={(e) => { e.target.src = fallbackPhoto; }}
                className="w-9 h-9 rounded-full ring-2 ring-primary/30 object-cover"
                alt=""
              />
            </div>
            <ul tabIndex="-1" className="menu menu-sm dropdown-content bg-base-100 rounded-2xl z-50 mt-2 w-48 p-2 shadow-xl border border-base-content/10">
              <li><Link to="/profile" className="rounded-xl">👤 Profile</Link></li>
              <li>
                <Link to="/premium" className="rounded-xl">
                  {user.isPremium ? "👑 Gold Member" : "⚡ Go Premium"}
                </Link>
              </li>
              <div className="divider my-0" />
              <li><a onClick={handleLogout} className="rounded-xl text-error hover:bg-error/10">🚪 Logout</a></li>
            </ul>
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
          <Link to="/connections" className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${isActive("/connections") ? "text-primary" : "text-base-content/50"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/connections") ? 2.5 : 1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
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
