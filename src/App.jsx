import React, { useState } from "react";
import Navbar from "./components/NavBar/Navbar.jsx";
import SignUp from "./components/LoginSignup/SignUp.jsx";

const App = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 

  return (
    <div>
      {/* Navigation bar with button to show login */}
      <Navbar onShowAuth={() => setShowAuth(true)} />
      
      {/* Login/Signup modal */}
      <SignUp 
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        mode={authMode}
        onModeSwitch={setAuthMode}
      />
    </div>
  );
}

export default App;