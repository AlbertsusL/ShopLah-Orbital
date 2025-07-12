import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserDetails(docSnap.data());
          }
        } catch (error) {
          console.error(error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userDetails && userDetails.email) {
      fetchOrders();
    }
  }, [userDetails]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/buyer/${userDetails.email}`);
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveReview = (order) => {
    navigate(`/buy/review/${order.id}`, { state: { order } });
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p>No orders found</p>
          <button 
            onClick={() => navigate('/buy/search')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Order #{order.id}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <p className="text-gray-600">{order.product_name}</p>
              <p className="text-gray-600">Quantity: {order.quantity}</p>
              <p className="font-medium">Total: ${order.total}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
              
              {order.status === 'delivered' && (
                <div className="mt-3">
                  {order.has_review ? (
                    <span className="text-green-600 text-sm">✓ Reviewed</span>
                  ) : (
                    <button 
                      onClick={() => handleLeaveReview(order)}
                      className="!bg-orange-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Write Review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;