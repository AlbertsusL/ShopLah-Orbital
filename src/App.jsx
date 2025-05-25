import React, { useState } from "react";
import Navbar from "./components/NavBar/Navbar.jsx";
import SignUp from "./components/LoginSignup/SignUp.jsx";
import MainPageView from "./components/MainPage/MainPageView.jsx";
import ContactUsPage from "./components/MainPage/ContactUsPage.jsx";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 

  return (
  <Router>
    <div>
      <Navbar onShowAuth={() => setShowAuth(true)} />
      <Routes>
        <Route path="/" element={<MainPageView />} />
        <Route path="/contactuspage" element={<ContactUsPage />} />
      </Routes>
      <SignUp 
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        mode={authMode}
        onModeSwitch={setAuthMode}
      />
    </div>
  </Router>
);
}

export default App;