import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Listings from "./components/Listings";
import Home from "./pages/Home";
import ShowListing from "./pages/ShowListing";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyBookings from "./pages/MyBookings";
import UserProfile from "./pages/UserProfile";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Navbar />
          
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/listings/:id" element={<ShowListing />} />
              <Route path="/create" element={<CreateListing />} />
              <Route path="/edit/:id" element={<EditListing />} />
              <Route path="/trips" element={<MyBookings />} />
              <Route path="/users/:id" element={<UserProfile />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;