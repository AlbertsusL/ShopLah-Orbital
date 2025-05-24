import React, { useState } from "react";
import user_icon from '../../assets/person.png';
import email_icon from '../../assets/email.png';
import password_icon from '../../assets/password.png';

const SignUp = ({ isOpen, onClose, mode, onModeSwitch }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Simple button click - just shows an alert and closes modal
  const handleSubmit = () => {
    if (mode === 'signup') {
      alert('Sign up button clicked! (This is just a demo)');
    } else {
      alert('Login button clicked! (This is just a demo)');
    }
    
    // Clear form and close modal
    setUsername('');
    setEmail('');
    setPassword('');
    onClose();
  };

  // Don't show anything if modal should be closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-lg flex items-center justify-center z-50">
      <div className='bg-white p-8 rounded-lg shadow-md max-w-md mx-auto'>
        
        {/* Header with title and close button */}
        <div className='mb-6 flex justify-between items-center'>
          <div>
            <div className="text-2xl font-bold text-center">
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </div>
            <div className="h-1 w-20 bg-amber-300 mx-auto mt-2"></div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
          
          {mode === 'signup' && (
            <div className="flex items-center border-b-2 border-gray-300 pb-2">
              <img src={user_icon} alt="User" className="w-5 h-5 mr-3" />
              <input 
                type="text" 
                placeholder="Your Name" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="outline-none w-full" 
              />
            </div>
          )}
          
          {/* Email */}
          <div className="flex items-center border-b-2 border-gray-300 pb-2">
            <img src={email_icon} alt="Email" className="w-6 h-4 mr-3" />
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="outline-none w-full" 
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
            />
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-4 justify-center mt-6">
          <button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-2 px-6 rounded-full cursor-pointer hover:opacity-90 transition-opacity"
          >
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
          
          <button 
            onClick={() => onModeSwitch(mode === 'signup' ? 'login' : 'signup')}
            className="bg-gray-200 text-gray-800 py-2 px-6 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
          >
            {mode === 'signup' ? 'Sign In Instead' : 'Create Account'}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default SignUp;