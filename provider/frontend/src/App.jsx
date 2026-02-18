import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import ProfileDashboard from "./pages/ProfileDashboard";
import ProfileJobs from "./pages/Profilejobs";
import ProfileEarnings from "./pages/ProfileEarnings";
import ProfileNotifications from "./pages/ProfileNotifications";
import ProfileDetailsPage from "./pages/ProfileDetailsPage";

function App() {
  const [homeServices, setHomeServices] = useState([
    { name: "Maid", img: "https://i.ibb.co/FWwM1h7/maid.jpg" },
    { name: "Painter", img: "https://i.ibb.co/4WqRCDP/painter.jpg" },
    { name: "Gardener", img: "https://i.ibb.co/pZMxjR1/gardener.jpg" },
  ]);

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("providerData")
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("providerData"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("providerData");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <main className="flex-grow pt-16">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                homeServices={homeServices}
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
              />
            }
          />
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/register"
            element={<Register setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/profile/*"
            element={
              isAuthenticated ? (
                <ProfilePage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route index element={<ProfileDashboard />} />
            <Route path="jobs" element={<ProfileJobs />} />
            <Route path="earnings" element={<ProfileEarnings />} />
            <Route path="notifications" element={<ProfileNotifications />} />
            <Route path="profiledetails" element={<ProfileDetailsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;