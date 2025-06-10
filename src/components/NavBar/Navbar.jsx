import user_icon from '../../assets/person.png';
import Logo from "../../assets/logo.jpg";
import { IoSearchOutline } from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserDetails(docSnap.data());
          }
        } catch (error) {
          console.error("User data load error:", error);
          if (error.code !== "permission-denied") {
            toast.error("Error loading user data");
          }
        }
      } else {
        setUserDetails(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBuyClick = (e) => {
    e.preventDefault();
    if (userDetails) {
      navigate('/buy/search');
    } else {
      toast.error("Please sign in to buy products");
      navigate("/signin", { state: { from: '/buy/search' } });
    }
  };

  const handleSellClick = (e) => {
    e.preventDefault();
    if (userDetails) {
      navigate('/sell');
    } else {
      toast.error("Please sign in to sell products");
      navigate("/signin", { state: { from: '/sell' } });
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
    <div className='sticky top-0'>
      {/* Upper Navbar */}
      <div className="shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40">
        <div className="bg-amber-300 py-2">
          <div className="container flex justify-between items-center">
            
            {/* Logo section */}
            <div>
              <Link to="/" className="font-bold text-2xl sm:text-3xl flex gap-2">
                <img src={Logo} alt="Logo" className="w-10 uppercase" />
                ShopLah
              </Link>    
            </div> 
            
            {/* Middle section with search and cart */}
            <div className="hidden md:flex items-center gap-5">
              
              {/* tabs section */}
              <div className="hidden md:flex gap-10 mr-4">
                <a href="#" className="font-medium text-gray-600 
                dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors">
                  Promotion
                </a>
                <a href="#" onClick={handleBuyClick} className="font-medium text-gray-600 
                dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors">
                  Buy 
                </a>
                <Link to="#" onClick={handleSellClick} className="font-medium text-gray-600 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors">
                  Sell
                </Link>
                <Link to="/ContactUsPage" className="font-medium text-gray-600 
                dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors">
                  Contact Us
                </Link>
              </div>
              {/* Search bar */}
              <div className="relative group hidden sm:block">
                <input 
                  type="text"
                  placeholder="Search"
                  className="w-[200px] sm:w-[200px] hover:w-[200px] 
                  transition-all duration-200 rounded-full border border-gray-700 px-2 py-1
                  focus:outline-none focus:border-1 focus:border-primary
                  placeholder-black bg-white text-black"
                />   
                <IoSearchOutline 
                  className="text-black hover:text-[#f3b15c] absolute top-2.5 -translate-y-0.5 right-3"
                />
              </div>
              
              {/* Cart button */}
              <button 
                onClick={() => alert("Cart clicked! (This is just a demo)")} 
                className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] 
                transition-all duration-200 text-white py-1 px-4 rounded-full flex 
                items-center gap-3 group"
              >
                <span className="group-hover:block hidden transition-all duration-200">
                  Cart
                </span>
                <FaCartShopping className="text-xl text-white drop-shadow sm:cursor-pointer"/>
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