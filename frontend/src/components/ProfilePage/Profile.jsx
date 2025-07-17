import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          console.log("User data not found");
        }
      } else {
        navigate("/signin");
      }
    });
  };

  useEffect(() => {
    fetchUserData();
    window.dispatchEvent(new Event("cart-updated"));
  }, []);

  const handleLogout = async () => {
    try {
      auth.signOut();
      navigate("/signin");
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Error logging out: " + error.message);
    }
  };

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          
          {/* Profile Pic */}
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
            {userDetails.user ? userDetails.user.charAt(0).toUpperCase() : 'U'}
          </div>
          
          {/* Welcome Message */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome, {userDetails.user}!
          </h1>
          
          {/* User Info */}
          <div className="space-y-3 mb-8 text-left">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium text-gray-800">{userDetails.user}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-800">{userDetails.email}</p>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-6 rounded-lg hover:from-amber-600 hover:to-orange-600 transition duration-200 font-medium"
            >
              Home Page
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-200 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;