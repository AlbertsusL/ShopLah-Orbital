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
import MyOrders from "./components/BuyProducts/MyOrders.jsx";
import SearchPage from "./components/BuyProducts/SearchPage.jsx";
import Checkout from "./components/BuyProducts/Checkout.jsx";
import ManageProducts from "./components/SellProducts/ManageProducts.jsx";
import ModifyProducts from "./components/SellProducts/ModifyProducts.jsx";
import ManageOrders from "./components/SellProducts/ManageOrders.jsx";
import Payment from "./components/BuyProducts/Payment.jsx";
import ManageAccount from "./components/SellProducts/ManageAccount.jsx";
import WriteReview from "./components/BuyProducts/WriteReview.jsx";
import Dashboard from "./components/SellProducts/Dashboard.jsx";
import { ToastContainer } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "./config/api.js";
import Cart from "./components/BuyProducts/Cart.jsx";
import CheckAuth from "./components/CheckAuth/CheckAuth.jsx";

const App = () => {
  const location = useLocation();
  const showSidebar = location.pathname.startsWith('/buy') || 
                     location.pathname.startsWith('/sell');
  
  const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

  return (
    <div>
      {location.pathname.startsWith('/buy') && <BuySideNavbar className="fixed top-16 left-0 z-40 h-full"/>}
      {location.pathname.startsWith('/sell') && <SideNavbar className="fixed top-16 left-0 z-40 h-full"/>}
      <Navbar className="sticky top-0 left-0 w-full z-50" />
      
      {/* Different content based on URL */}
      <div className={showSidebar ? "ml-64" : "content"}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainPageView />} />
          <Route path="/contactuspage" element={<ContactUsPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          {/* Protected routes - need to be signed in */}
          <Route path="/profile" element={<CheckAuth page={<Profile />} />} />

          {/* Sell routes - protected */}
          <Route path="/sell" element={<CheckAuth page={<SellProducts />} />} />
          <Route path="/sell/manage" element={<CheckAuth page={<ManageProducts />} />} />
          <Route path='/sell/modify/:id' element={<CheckAuth page={<ModifyProducts />} />} />
          <Route path='/sell/manageorders' element={<CheckAuth page={<ManageOrders />} />} />
          <Route path='/sell/account' element={<CheckAuth page={<ManageAccount />} />} />
          <Route path="/sell/dashboard" element={<CheckAuth page={<Dashboard />} />}/>

          {/* Buy routes - protected */}
          <Route path="/buy/search" element={<CheckAuth page={<SearchPage />} />} />
          <Route path="/buy/product/:id" element={<CheckAuth page={<ProductDetail />} />} />
          <Route path="/buy/myorders" element={<CheckAuth page={<MyOrders />} />} />
          <Route path="/buy/review/:orderId" element={<CheckAuth page={<WriteReview />} />} />
          <Route path="/buy/cart" element={<CheckAuth page={<Cart />} />} />
          <Route path="/checkout" element={<CheckAuth page={<Checkout />} />} />
          <Route path="/payment" element={
            <CheckAuth page={
              <Elements stripe={stripePromise}>
                <Payment />
              </Elements>
            } />
          }/>
        </Routes>
      </div>
      
      <ToastContainer />
    </div>
  );
}

export default App;