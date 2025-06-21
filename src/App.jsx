import React from "react";
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from "./components/NavBar/Navbar.jsx";
import MainPageView from "./components/MainPage/MainPageView.jsx";
import ContactUsPage from "./components/MainPage/ContactUsPage.jsx";
import SignInPage from "./components/LoginSignup/SignInPage.jsx";
import SignUpPage from "./components/LoginSignup/SignUpPage.jsx";
import Profile from "./components/ProfilePage/Profile.jsx";
import SellProducts from "./components/SellProducts/SellProducts.jsx";
import SideNavbar from "./components/NavBar/SideNavbar.jsx";
import BuySideNavbar from "./components/NavBar/BuySideNavBar.jsx";
import ProductDetail from "./components/BuyProducts/ProductDetail.jsx";
import SearchPage from "./components/BuyProducts/SearchPage.jsx";
import Checkout from "./components/BuyProducts/Checkout.jsx";
import ManageProducts from "./components/SellProducts/ManageProducts.jsx";
import ModifyProducts from "./components/SellProducts/ModifyProducts.jsx";
import ManageAccount from "./components/SellProducts/ManageAccount.jsx";
import Payment from "./components/BuyProducts/payment.jsx";
import { ToastContainer } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const App = () => {
  const location = useLocation();
  const showSidebar = location.pathname.startsWith('/buy') || 
                     location.pathname.startsWith('/sell');
  const stripePromise = loadStripe("pk_test_51RcLk9Fx0Ih7WgJ9LKuLhVMdhepeYdn5xxn0gdSxd7MOE15xNOBomgShv8TUsOshvsVpSVE3A2RRKGALwAQpjx4k00xQDG3e5s");
  return (
    <div>
      {location.pathname.startsWith('/buy') && <BuySideNavbar />}
      {location.pathname.startsWith('/sell') && <SideNavbar />}
      <Navbar style={{ position: 'sticky', top: 0, zIndex: 1}} />
      
      {/* Different content based on URL */}
      <div className={showSidebar ? "ml-64" : "content"}>
        <Routes>
          <Route path="/" element={<MainPageView />} />
          <Route path="/contactuspage" element={<ContactUsPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Sell route */}
          <Route path="/sell" element={<SellProducts />} />
          <Route path="/sell/manage" element={<ManageProducts />} />
          <Route path='/sell/modify/:id' element={<ModifyProducts />} />
          <Route path='/sell/account' element={<ManageAccount />} />
          
          {/* Buy route */}
          <Route path="/buy/search" element={<SearchPage />} />
          <Route path="/buy/product/:id" element={<ProductDetail />} />
          <Route path="/payment" element={
            <Elements stripe={stripePromise}>
              <Payment />
            </Elements>
          }
        />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
      
      <ToastContainer />
    </div>
  );
}

export default App;