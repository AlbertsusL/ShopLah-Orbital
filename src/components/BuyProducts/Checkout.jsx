import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
      toast.error('Please fill in all information');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      toast.success('Order placed successfully!');
      navigate('/profile');
    }, 2000);
  };

  const finalTotal = orderData.total;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Customer Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#f3b15c]"
                required
              />
              
              <input
                type="email"
                placeholder="Email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#f3b15c]"
                required
              />
              
              <input
                type="tel"
                placeholder="Phone Number"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#f3b15c]"
              />
              
              <textarea
                placeholder="Shipping Address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 h-20 focus:ring-2 focus:ring-[#f3b15c]"
                required
              />
              
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : `Place Order - $${finalTotal.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {/* Product */}
            <div className="flex gap-4 mb-4">
              <img 
                src={orderData.product.image} 
                alt={orderData.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-medium">{orderData.product.name}</h3>
                <p className="text-gray-600">Category: {orderData.product.category}</p>
                <p className="text-gray-600">Qty: {orderData.quantity}</p>
                <p className="font-semibold">${orderData.product.price}</p>
              </div>
            </div>
            
            <hr className="my-4" />
            
            {/* Pricing */}
            <div className="space-y-2">
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;