import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { addUser } from "./utils/userSlice";
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

  useEffect(() => {
    let fetchedUser = null;
    axios
      .get(BASE_URL + "/api/profile/view", { withCredentials: true })
      .then((res) => {
        fetchedUser = res.data.user;
        dispatch(addUser(fetchedUser));
        return axios.get(BASE_URL + "/api/payment/verify", { withCredentials: true });
      })
      .then((res) => {
        dispatch(addUser({ ...fetchedUser, isPremium: res.data.isPremium }));
      })
      .catch(() => {});
  }, []);

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
      <Footer />
    </div>
  );
}

export default App;
