import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { addUser } from "./utils/userSlice";
import { setUnauthenticated } from "./utils/authSlice";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Profile from "./Components/Profile";
import Connections from "./Components/Connections";
import Discover from "./Components/Discover";
import Home from "./Components/Home";
import Chat from "./Components/Chat";
import ProtectedRoute from "./Components/ProtectedRoute";
import NotFound from "./Components/NotFound";
import Privacy from "./Components/Privacy";
import Premium from "./Components/Premium";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    axios
      .get(BASE_URL + "/profile/view", { withCredentials: true })
      .then((res) => {
        const fetchedUser = res.data.user;
        dispatch(addUser(fetchedUser));

        axios
          .get(BASE_URL + "/payment/verify", { withCredentials: true })
          .then((pr) => dispatch(addUser({ ...fetchedUser, isPremium: pr.data.isPremium })))
          .catch(() => {});
      })
      .catch(() => {
        dispatch(setUnauthenticated());
      });
  }, [dispatch]);

  const noFooterRoutes = ["/login", "/signup"];
  const hideFooter = noFooterRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/chat");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/discover" element={<Discover />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat/:userId" element={<Chat />} />
            <Route path="/premium" element={<Premium />} />
          </Route>
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;
