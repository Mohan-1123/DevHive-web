import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="card bg-base-300 w-full max-w-96 mx-4 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="text-5xl sm:text-6xl font-bold text-error">404</h2>
          <p className="text-xl font-semibold mt-2">Page Not Found</p>
          <p className="text-sm mt-1">
            The page you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn btn-primary mt-4">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
