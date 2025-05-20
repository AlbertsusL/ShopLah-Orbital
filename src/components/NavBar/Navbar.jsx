import React from "react";
import Logo from "../../assets/logo.jpg";

const Navbar = () => {
  return (<div>
    {/*Upper Navbar*/}
    <div className ="shadow-md bg-white dark:bg-gray-900 dark:text-white">
        <div className="bg-amber-400 py-2">
            <div className="container flex 
            justify-between items-center">
                <div>
                <a href="#" className="font-bold text-2xl sm:text-3xl flex gap-2">
                    <img src={Logo} alt="Logo"
                    className="w-10 uppercase" />
                    ShopLah
                </a>    
            </div>  
            <div>
                <div>
                    <input type="text"
                    placeholder="search"
                    className="w-[200px] sm:w-[300px] group-hover:w-[500px] 
                    transition-all duration-200 rounded-full border border-gray-500 px-2 py-1
                    focus:outline-none focus:border-1
                    focus:border-primary"/>
                </div>
                </div>
            </div>
        </div>
    </div>
    {/*Lower Navbar*/}
    <div></div>
  </div>)
};

export default Navbar;