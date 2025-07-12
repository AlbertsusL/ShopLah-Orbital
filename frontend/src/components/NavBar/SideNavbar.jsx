import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faList, faChartSimple, faBarsProgress, faHandshake } from '@fortawesome/free-solid-svg-icons';

const SideNavbar = () => {
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-amber-50 shadow-md border-r border-amber-200 pt-16">
      
      {/* Header */}
      <div className="p-4 border-b border-amber-200">
        <h2 className="text-lg font-semibold text-amber-800">Sell</h2>
      </div>

      {/* Navigation Items */}
      <div className="p-2">
        <Link
          to="/sell"
          className={`flex items-center p-3 rounded-lg transition-colors ${
            location.pathname === '/sell' 
              ? 'bg-amber-200 text-amber-900' 
              : 'text-amber-800 hover:bg-amber-100'
          }`}
        >
          <FontAwesomeIcon icon={faList} size="lg" className='mr-2'/> 
          <span className="font-medium">List Items</span>
        </Link>
      </div>
      
      <div className="p-2">
        <Link
          to="/sell/manage"
          className={`flex items-center p-3 rounded-lg transition-colors ${
            location.pathname === '/sell/manage' 
              ? 'bg-amber-200 text-amber-900' 
              : 'text-amber-800 hover:bg-amber-100'
          }`}
        >
          <FontAwesomeIcon icon={faBarsProgress} size="lg" className='mr-2'/> 
          <span className="font-medium">Manage Products</span>
        </Link>
      </div>

      <div className="p-2">
        <Link
          to="/sell/manageorders"
          className={`flex items-center p-3 rounded-lg transition-colors ${
            location.pathname === '/sell/manageorders' 
              ? 'bg-amber-200 text-amber-900' 
              : 'text-amber-800 hover:bg-amber-100'
          }`}
        >
          <FontAwesomeIcon icon={faHandshake} size="lg" className='mr-2'/> 
          <span className="font-medium">Manage Orders</span>
        </Link>
      </div>

      <div className="p-2">
        <Link
          to="/sell/dashboard"
          className={`flex items-center p-3 rounded-lg transition-colors ${
            location.pathname === '/sell/dashboard' 
              ? 'bg-amber-200 text-amber-900' 
              : 'text-amber-800 hover:bg-amber-100'
          }`}
        >
          <FontAwesomeIcon icon={faChartSimple} size="lg" className='mr-2'/> 
          <span className="font-medium">Dashboard</span>
        </Link>
      </div>
      
      <div className="p-2">
        <Link
          to="/sell/account"
          className={`flex items-center p-3 rounded-lg transition-colors ${
            location.pathname === '/sell/account' 
              ? 'bg-amber-200 text-amber-900' 
              : 'text-amber-800 hover:bg-amber-100'
          }`}
        >
          <FontAwesomeIcon icon={faDollarSign} size="lg" className='mr-2'/> 
          <span className="font-medium">My Account</span>
        </Link>
      </div>
    </div>
  );
};

export default SideNavbar;