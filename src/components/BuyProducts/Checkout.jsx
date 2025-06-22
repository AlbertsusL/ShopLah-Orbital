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

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
      toast.error('Please fill in all information');
      return;
    }

    navigate('/payment', {
      state: {
        productId: orderData.product.id,
        quantity: orderData.quantity,
        buyerName: customerInfo.name,
        buyerEmail: customerInfo.email,
        buyerAddress: customerInfo.address,
        buyerPhone: customerInfo.phone,
        total: orderData.total,
        sellerId: orderData.sellerId,
      }
    });

  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Customer Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Information</h2>
            
            <form onSubmit={handleCheckout} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
              
              <input
                type="email"
                placeholder="Your Email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
              
              <input
                type="tel"
                placeholder="Phone Number"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              
              <textarea
                placeholder="Your Address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                required
              />
              
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : `Buy Now - $${orderData.total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Order</h2>
            
            <div className="flex gap-4 mb-4">
              <img 
                src={orderData.product.images && orderData.product.images.length > 0 ? orderData.product.images[0].image_url : 'https://via.placeholder.com/64x64'} 
                alt={orderData.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-medium">{orderData.product.name}</h3>
                <p className="text-gray-600">Quantity: {orderData.quantity}</p>
                <p className="font-semibold">${orderData.product.price}</p>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-bold">${orderData.total.toFixed(2)}</span>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm">📧 After you buy:</p>
              <p className="text-sm">• You get confirmation email</p>
              <p className="text-sm">• Seller gets order details</p>
              <p className="text-sm">• Delivery in 2 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;