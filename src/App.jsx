import React from "react";
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from "./components/NavBar/Navbar.jsx";
import MainPageView from "./components/MainPage/MainPageView.jsx";
import ContactUsPage from "./components/MainPage/ContactUsPage.jsx";
import SignInPage from "./components/LoginSignup/SignInPage.jsx";
import SignUpPage from "./components/LoginSignup/SignUpPage.jsx";
import Profile from "./components/ProfilePage/Profile.jsx";
import SellProducts from "./components/SellProducts/sellProducts.jsx";
import BuyProducts from "./components/BuyProducts/BuyProducts.jsx";
import SideNavbar from "./components/NavBar/SideNavbar.jsx";
import BuySideNavbar from "./components/NavBar/BuySideNavBar.jsx";

import { ToastContainer } from "react-toastify";

const App = () => {
  const location = useLocation();
  const showSidebar = location.pathname === '/BuyProducts' || location.pathname === '/SellProducts';

  return (
    <div>
      {/* Navbar appears on ALL pages */}
      <Navbar />

      {/* Side Navbar */}
      {location.pathname === '/BuyProducts' && <BuySideNavbar />}
      {location.pathname === '/SellProducts' && <SideNavbar />}
      
      {/* Different content based on URL */}
      <div className={showSidebar ? "ml-64" : ""}>
        <Routes>
          <Route path="/" element={<MainPageView />} />
          <Route path="/contactuspage" element={<ContactUsPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sellproducts" element={<SellProducts />} />
          <Route path="/buyproducts" element={<BuyProducts />} />
        </Routes>
      </div>
      
      <ToastContainer />
    </div>
  );
}

export default App;