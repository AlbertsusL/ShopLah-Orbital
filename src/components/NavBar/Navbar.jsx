import React from "react";
import Logo from "../../assets/logo.jpg";
import { IoSearchOutline } from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6"

const Navbar = () => {
  return (<div>
    {/*Upper Navbar*/}
    <div className ="shadow-md bg-white dark:bg-gray-900 dark:text-white
    duration-200 relative z-40">
        <div className="bg-amber-300 py-2">
            <div className="container flex 
            justify-between items-center">
                <div>
                <a href="#" className="font-bold text-2xl sm:text-3xl flex gap-2">
                    <img src={Logo} alt="Logo"
                    className="w-10 uppercase" />
                    ShopLah
                </a>    
            </div>  
            <div className="flex justify-between items-center gap-4">
                <div className="relative group hidden sm:block">
                    <input type="text"
                    placeholder="search"
                    className="w-[200px] sm:w-[200px] hover:w-[300px] 
                    transition-all duration-200 rounded-full border border-gray-700 px-2 py-1
                    focus:outline-none focus:border-1
                    focus:border-primary
                    placeholder-black bg-white"/>   
                    <IoSearchOutline 
                    className="text-black
                    hover:text-[#f3b15c] absolute top-2.5 -translate-y-0.5
                    right-3"
                    />
                    </div>
                </div>
                <button onClick={
                    () => alert("This feature not available yet")
                } className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] 
                transition-all duration-200 text-white py-1 px-4 rounded-full flex 
                items-center gap-3 group">
                    <span className="group-hover:block hidden transition-all duration-200">
                        Order
                    </span>
                    <FaCartShopping className="text-xl text-white drop-shadow sm:cursor-pointer"/>
                </button>
            </div>
        </div>
    </div>
    {/*Lower Navbar*/}
    <div></div>
  </div>)
};

export default Navbar;