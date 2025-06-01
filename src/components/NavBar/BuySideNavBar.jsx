import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faTruck, faHeart } from '@fortawesome/free-solid-svg-icons';

const BuySideNavbar = () => {
  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-amber-50 shadow-md border-r border-amber-200 pt-16">
      
      {/* Header */}
      <div className="p-4 border-b border-amber-200">
        <h2 className="text-lg font-semibold text-amber-800">Buy</h2>
      </div>

      {/* Navigation Item */}
      <div className="p-2">
        <Link
          to="/"
          className="flex items-center p-3 rounded-lg transition-colors text-amber-800 hover:bg-amber-100"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" className='mr-2'/> 
          <span className="font-medium">Browse</span>
        </Link>
      </div>
      {/* Delivery Tracking */}
      <div className="p-2">
        <Link
          to="/"
          className="flex items-center p-3 rounded-lg transition-colors text-amber-800 hover:bg-amber-100"
        >
          <FontAwesomeIcon icon={faTruck} size="lg" className='mr-2'/> 
          <span className="font-medium">Delivery Tracking</span>
        </Link>
      </div>
      {/* Favourites */}
      <div className="p-2">
        <Link
          to="/"
          className="flex items-center p-3 rounded-lg transition-colors text-amber-800 hover:bg-amber-100"
        >
          <FontAwesomeIcon icon={faHeart} size="lg" className='mr-2'/> 
          <span className="font-medium">Favourite</span>
        </Link>
      </div>
    </div>
  );
};

export default BuySideNavbar;