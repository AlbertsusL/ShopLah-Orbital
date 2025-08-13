import user_icon from '../../assets/person.png';
import Logo from "../../assets/logo.jpg";
import { FaCartShopping } from "react-icons/fa6";
import { Link, useRouteLoaderData } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { API_BASE_URL } from "../../config/api.js";

const Navbar = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [cartCountValue, setCartCountValue] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserDetails(docSnap.data());
            cartCount(docSnap.data().ID);
          }
        } catch (error) {
          console.error("User data load error:", error);
          if (error.code !== "permission-denied") {
            toast.error("Error loading user data");
          }
        }
      } else {
        setUserDetails(null);
        setCartCountValue(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
  const handleCartUpdate = () => {
    if (userDetails?.ID) {
      cartCount(userDetails.ID);
    } else {
      setCartCountValue(0);
    }
  };

  window.addEventListener("cart-updated", handleCartUpdate);
  return () => window.removeEventListener("cart-updated", handleCartUpdate);
}, [userDetails]);

  const handleBuyClick = (e) => {
    e.preventDefault();
    if (userDetails) {
      navigate('/buy/search');
    } else {
      localStorage.setItem('redirectAfterLogin', '/buy/search');
      toast.error("Please sign in to browse products");
      navigate("/signin");
    }
  };
  const cartCount = async (userId) => {
    if (userId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/cartcount/${userId}`);
        setCartCountValue(response.data.cart);
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartCountValue(0);
      }
    }
  }
  const handleCartClick = (e) => {
    e.preventDefault();
    if (userDetails) {
      navigate('/buy/cart');
    } else {
      localStorage.setItem('redirectAfterLogin', '/buy/cart');
      toast.error("Please sign in to view cart");
      navigate("/signin");
    }
  };

  const handleSellClick = (e) => {
    e.preventDefault();
    if (userDetails) {
      navigate('/sell');
    } else {
      localStorage.setItem('redirectAfterLogin', '/sell');
      toast.error("Please sign in to sell products");
      navigate("/signin");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16 bg-amber-300">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className='sticky top-0 z-50'>
      <div className="shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40">
        <div className="bg-amber-300 py-2">
          <div className="container flex justify-between items-center">
            <div>
              <Link to="/" className="font-bold text-2xl sm:text-3xl flex gap-2">
                <img src={Logo} alt="Logo" className="w-10 uppercase" />
                ShopLah
              </Link>    
            </div> 
            <div className="hidden md:flex items-center gap-5">

              <div className="hidden md:flex gap-10 mr-4">
                <Link to="#" onClick={handleBuyClick} className="font-medium text-gray-600 
                dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors">
                  Buy 
                </Link>
                <Link to="#" onClick={handleSellClick} className="font-medium text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors">
                  Sell
                </Link>
                <Link to="/ContactUsPage" className="font-medium text-gray-600 
                dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors">
                  Contact Us
                </Link>
              </div>
              
              {/* Cart button */}
              <button 
                onClick={handleCartClick}
                className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] 
                transition-all duration-200 text-white py-1 px-4 rounded-full flex 
                items-center gap-3 group relative"
              >
                <span className="group-hover:block hidden transition-all duration-200">
                  Cart
                </span>
                <FaCartShopping className="text-xl text-white drop-shadow sm:cursor-pointer"/>
                {cartCountValue > 0 && userDetails!==null && (
                  <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full'>{cartCountValue}</span>
                )}
              </button>
              
              {/* Sign In */}
              <div className="flex items-center gap-2">
                {userDetails ? (
                  <Link 
                    to="/profile"
                    className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white px-6 py-2 rounded-full hover:opacity-90 font-medium transition-opacity flex items-center gap-2"
                  >
                    <img src={user_icon} alt="User" width={16} />
                    {userDetails.user || "Profile"}
                  </Link>
                ) : (
                  <Link 
                    to="/signin"
                    className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white px-6 py-2 rounded-full hover:opacity-90 font-medium transition-opacity flex items-center gap-2"
                  >
                    <img src={user_icon} alt="User" width={16} />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;