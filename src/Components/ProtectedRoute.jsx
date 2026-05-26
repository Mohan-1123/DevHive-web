import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AuthLoader = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
    <div className="flex flex-col items-center gap-3">
      <span
        className="w-8 h-8 rounded-full border-2 border-base-content/15 animate-spin"
        style={{ borderTopColor: "#8b5cf6" }}
      />
      <span className="text-xs text-base-content/40 font-medium tracking-wide uppercase">
        Loading…
      </span>
    </div>
  </div>
);

const ProtectedRoute = () => {
  const user       = useSelector((state) => state.user);
  const authStatus = useSelector((state) => state.auth.status);
  const location   = useLocation();

  if (authStatus === "checking") return <AuthLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
