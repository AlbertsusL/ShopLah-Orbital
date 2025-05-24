// Simple Navbar - Just a working Sign In button!
import React from "react";
import Logo from "../../assets/logo.jpg";
import { IoSearchOutline } from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6";

const Navbar = ({ onShowAuth }) => {
  return (
    <div>
      {/* Upper Navbar */}
      <div className="shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40">
        <div className="bg-amber-300 py-2">
          <div className="container flex justify-between items-center">
            
            {/* Logo section */}
            <div>
              <a href="#" className="font-bold text-2xl sm:text-3xl flex gap-2">
                <img src={Logo} alt="Logo" className="w-10 uppercase" />
                ShopLah
              </a>    
            </div>  
            
            {/* Middle section with search and cart */}
            <div className="hidden md:flex items-center gap-5">
              
              {/* tabs section */}
              <div className="hidden md:flex gap-10 mr-4">
                <a href="#" className="font-medium text-gray-600 
                dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors">
                  Top Rated
                </a>
                <a href="#" className="font-medium text-gray-600 
                dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors">
                  Trending
                </a>
                <a href="#" className="font-medium text-gray-600 
                dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors">
                  Best Selling
                </a>
                <a href="#" className="font-medium text-gray-600 
                dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors">
                  Contact Us
                </a>
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
                  Order
                </span>
                <FaCartShopping className="text-xl text-white drop-shadow sm:cursor-pointer"/>
              </button>
              
              {/* Simple Sign In button */}
              <button
                onClick={onShowAuth}
                className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white px-4 py-1 rounded-full hover:opacity-90 font-medium transition-opacity"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lower Navbar - Empty for now */}
    </div>
  );
};

export default Navbar;