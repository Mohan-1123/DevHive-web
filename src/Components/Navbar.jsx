import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../utils/userSlice";
import { useNavigate, Link } from "react-router-dom";

const fallbackPhoto = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(removeUser());
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-300 shadow-sm px-4">
      <div className="flex-1">
        <Link to={user ? "/discover" : "/"} className="btn btn-ghost text-xl font-bold text-primary">
          devHive
        </Link>
      </div>
      {user && (
        <div className="flex items-center gap-2">
          <Link to="/discover" className="btn btn-ghost btn-sm hidden sm:flex">Discover</Link>
          <Link to="/connections" className="btn btn-ghost btn-sm hidden sm:flex">Connections</Link>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img
                  alt={`${user.firstName}'s avatar`}
                  src={user.photoUrl || fallbackPhoto}
                  onError={(e) => { e.target.src = fallbackPhoto; }}
                />
              </div>
            </div>
            <ul
              tabIndex="-1"
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
            >
              <li className="menu-title px-2 py-1 text-sm font-semibold">
                {user.firstName} {user.lastName}
              </li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/discover" className="sm:hidden">Discover</Link></li>
              <li><Link to="/connections" className="sm:hidden">Connections</Link></li>
              <li><a onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>
        </div>
      )}
      {!user && (
        <div className="flex gap-2">
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
