import React, { useState, useEffect } from 'react';
import { auth } from "../../firebase/firebase";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const CheckAuth = ({ page }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (!currentUser) {
        // User is not signed in
        toast.error("Please sign in to access this page");
        
        const whereTheyWantedToGo = location.pathname;
        localStorage.setItem('redirectAfterLogin', whereTheyWantedToGo);
        
        navigate('/signin');
      }
    });

    return () => unsubscribe();
  }, [navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to access this page</p>
          <button 
            onClick={() => {
              localStorage.setItem('redirectAfterLogin', location.pathname);
              navigate('/signin');
            }}
            className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white px-6 py-2 rounded-full"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return page;
};

export default CheckAuth;