import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import email_icon from '../../assets/email.png';
import password_icon from '../../assets/password.png';
import './SignIn&Up.css';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebase"
import { toast } from "react-toastify"

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");
      navigate("/profile")
      toast.success("User Registered Successfully!!", {
            position: "top-center",
        })
      } catch (error) {
        console.log(error.message);
        toast.error(error.message, {
          position: "bottom-center",
        })
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Sign In Form */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          
          {/* Form Header */}
          <div className='mb-6'>
            <div className="text-2xl font-bold text-center">Sign In</div>
            <div className="h-1 w-20 bg-amber-300 mx-auto mt-2"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Email */}
            <div className="flex items-center border-b-2 border-gray-300 pb-2">
              <img src={email_icon} alt="Email" className="w-6 h-4 mr-3" />
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="outline-none w-full" 
                required
              />
            </div>
            
            {/* Password */}
            <div className="flex items-center border-b-2 border-gray-300 pb-2">
              <img src={password_icon} alt="Password" className="w-5 h-5 mr-3" />
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="outline-none w-full" 
                required
              />
            </div>
            
            {/* Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <button 
                type="button"
                onClick={() => alert('TBD')} 
                className="forgot-btn"
              >
                Forgot password?
              </button>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex gap-4 justify-center mt-6">
              <button type="submit" className="btn-primary">
                Sign In
              </button>
              
              <Link to="/signup" className="btn-secondary">
                Create Account
              </Link>
            </div>
          </form>
        </div>     
      </div>
    </div>
  );
};

export default SignInPage;