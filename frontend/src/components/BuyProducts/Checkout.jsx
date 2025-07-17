import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData = [] } = location.state || {};
  
  const [userDetails, setUserDetails] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '', 
    address: '',
    phone: ''
  });

  const grandTotal = orderData.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)


  const [isProcessing, setIsProcessing] = useState(false);

  const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            const primaryImage = product.images.find(img => img.is_primary);
            return primaryImage ? primaryImage.image_url : product.images[0].image_url;
        }
        return 'https://via.placeholder.com/300x200?text=No+Image';
    };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserDetails(userData);
            setCustomerInfo(prev => ({
              ...prev,
              email: userData.email,
              name: userData.user 
            }));
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          toast.error("Error loading user data");
        }
      } 
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.email || !customerInfo.address || !customerInfo.phone) {
      toast.error('Please fill in all information');
      return;
    }

    navigate('/payment', {
      state: {
      buyerName: userDetails.user,
      buyerEmail: userDetails.email,
      buyerAddress: customerInfo.address,
      buyerPhone: customerInfo.phone,
      grandTotal,
      orderData,
  }
});
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
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
                {isProcessing ? 'Processing...' : `Buy Now - $${grandTotal.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Order</h2>
            
            {orderData.map((item, index) => (
              <div key={index} className="flex gap-4 mb-4">
              <img 
                src={getProductImage(item.product) || 'https://via.placeholder.com/64x64'} 
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
                <p className="font-semibold">${Number(item.product.price).toFixed(2)}</p>
                <p className="text-gray-700">Subtotal: ${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
            ))}
            
            <hr className="my-4" />
            
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-bold">${grandTotal.toFixed(2)}</span>
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