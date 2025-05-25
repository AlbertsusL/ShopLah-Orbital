import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from "./components/NavBar/Navbar.jsx";
import MainPageView from "./components/MainPage/MainPageView.jsx";
import ContactUsPage from "./components/MainPage/ContactUsPage.jsx";
import SignInPage from "./components/LoginSignup/SignInPage.jsx";
import SignUpPage from "./components/LoginSignup/SignUpPage.jsx";

const App = () => {
  return (
    <Router>
      <div>
        {/* Navbar appears on ALL pages */}
        <Navbar />
        
        {/* Different content based on URL */}
        <Routes>
          <Route path="/" element={<MainPageView />} />
          <Route path="/contactuspage" element={<ContactUsPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;