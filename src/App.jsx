import React from "react";
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from "./components/NavBar/Navbar.jsx";
import MainPageView from "./components/MainPage/MainPageView.jsx";
import ContactUsPage from "./components/MainPage/ContactUsPage.jsx";
import SignInPage from "./components/LoginSignup/SignInPage.jsx";
import SignUpPage from "./components/LoginSignup/SignUpPage.jsx";
import Profile from "./components/ProfilePage/Profile.jsx";
import SellProducts from "./components/SellProducts/SellProducts.jsx";
import BuyProducts from "./components/BuyProducts/BuyProducts.jsx";
import SideNavbar from "./components/NavBar/SideNavbar.jsx";
import BuySideNavbar from "./components/NavBar/BuySideNavBar.jsx";
import ProductDetail from "./components/BuyProducts/ProductDetail.jsx";
import SearchPage from "./components/BuyProducts/SearchPage.jsx";
import Checkout from "./components/BuyProducts/Checkout.jsx";
import { ToastContainer } from "react-toastify";

const App = () => {
  const location = useLocation();
  const showSidebar = location.pathname.startsWith('/buy') || 
                     location.pathname.startsWith('/sell');

  return (
    <div>
      {location.pathname.startsWith('/buy') && <BuySideNavbar />}
      {location.pathname.startsWith('/sell') && <SideNavbar />}
      <Navbar />
      
      {/* Different content based on URL */}
      <div className={showSidebar ? "ml-64" : ""}>
        <Routes>
          <Route path="/" element={<MainPageView />} />
          <Route path="/contactuspage" element={<ContactUsPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Sell route */}
          <Route path="/sell" element={<SellProducts />} />
          
          {/* Buy route */}
          <Route path="/buy/search" element={<SearchPage />} />
          <Route path="/buy/products" element={<BuyProducts />} />
          <Route path="/buy/product/:id" element={<ProductDetail />} />
          
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
      
      <ToastContainer />
    </div>
  );
}

export default App;