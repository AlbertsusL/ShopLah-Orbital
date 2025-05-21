import React from "react";
import user_icon from '../../assets/person.png';
import email_icon from '../../assets/email.png';
import password_icon from '../../assets/password.png';


const SignUp = () => {
    return (
        <div className='SignUp-container bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-10'>
            <div className='header mb-6'>
                <div className="text text-2xl font-bold text-center">Sign Up</div>
                <div className="underline h-1 w-20 bg-amber-300 mx-auto mt-2"></div>
            </div>
            <div className="inputs flex flex-col gap-4">
                <div className="SignUp-input flex items-center border-b-2 border-gray-300 pb-2">
                    <img src={user_icon} alt="User" className="w-6 h-6 mr-3" />
                    <input type="text" placeholder="Username" className="outline-none w-full" />
                </div>
                <div className="SignUp-input flex items-center border-b-2 border-gray-300 pb-2">
                    <img src={email_icon} alt="Email" className="w-6 h-6 mr-3" />
                    <input type="email" placeholder="Email" className="outline-none w-full" />
                </div>
                <div className="SignUp-input flex items-center border-b-2 border-gray-300 pb-2">
                    <img src={password_icon} alt="Password" className="w-6 h-6 mr-3" />
                    <input type="password" placeholder="Password" className="outline-none w-full" />
                </div>
            </div>
            <div className="forgot-password text-sm text-gray-600 mt-4 text-center">
                Lost Password? <span className="text-amber-500 cursor-pointer">Click here!</span>
            </div>
            <div className="submit-container flex gap-4 justify-center mt-6">
                <div className="submit bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-2 px-6 rounded-full cursor-pointer">Sign Up</div>
                <div className="submit bg-gray-200 text-gray-800 py-2 px-6 rounded-full cursor-pointer">Login</div>
            </div>
        </div>
    )
}

export default SignUp;