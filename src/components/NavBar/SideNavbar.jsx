import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const SideNavbar = () => {
  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-amber-50 shadow-md border-r border-amber-200 pt-16">
      
      {/* Header */}
      <div className="p-4 border-b border-amber-200">
        <h2 className="text-lg font-semibold text-amber-800">Navigation</h2>
      </div>

      {/* Navigation Item */}
      <div className="p-4">
        <Link
          to="/"
          className="flex items-center p-3 rounded-lg transition-colors text-amber-800 hover:bg-amber-100"
        >
          <FaHome size={18} className="mr-3" />
          <span className="font-medium">Home</span>
        </Link>
      </div>
    </div>
  );
};

export default SideNavbar;