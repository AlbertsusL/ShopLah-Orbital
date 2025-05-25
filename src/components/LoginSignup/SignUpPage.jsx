import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import user_icon from '../../assets/person.png';
import email_icon from '../../assets/email.png';
import password_icon from '../../assets/password.png';
import './SignIn&Up.css';
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../../firebase/firebase"
import { setDoc,doc } from "firebase/firestore";
import { toast } from "react-toastify"

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth,email,password);
      const user = auth.currentUser;
      console.log(user);
      if (user) {
        await setDoc(doc(db,"Users",user.uid), {
          email: user.email,
          user: username,
          ID: user.uid,
        });

      }
      console.log("User Registered Successfully!!")
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Sign Up Form */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          
          {/* Form Header */}
          <div className='mb-6'>
            <div className="text-2xl font-bold text-center">Create Account</div>
            <div className="h-1 w-20 bg-amber-300 mx-auto mt-2"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Username */}
            <div className="flex items-center border-b-2 border-gray-300 pb-2">
              <img src={user_icon} alt="User" className="w-5 h-5 mr-3" />
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="outline-none w-full" 
                required
              />
            </div>
            
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
                placeholder="Create a password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="outline-none w-full" 
                required
              />
            </div>
            
            {/* Confirm Password */}
            <div className="flex items-center border-b-2 border-gray-300 pb-2">
              <img src={password_icon} alt="Confirm Password" className="w-5 h-5 mr-3" />
              <input 
                type="password" 
                placeholder="Confirm your password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="outline-none w-full" 
                required
              />
            </div>
            
            {/* Submit Buttons */}
            <div className="flex gap-4 justify-center mt-6">
              <button type="submit" className="btn-primary">
                Create Account
              </button>
              
              <Link to="/signin" className="btn-secondary">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;