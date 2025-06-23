import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserDetails(docSnap.data());
          } else {
            setError("User not found");
          }
        } catch (error) {
          setError("Error loading user data");
        }
      } else {
        setError("Not logged in");
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
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders/buyer/${userDetails.email}`);
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    searchTerm === '' || 
    order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

  if (loading) {
    return <div style={{padding: '20px'}}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{padding: '20px'}}>
        <p>Error: {error}</p>
        <button onClick={fetchOrders}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{padding: '20px'}}>
      <h1>My Orders</h1>
      
      <div style={{marginBottom: '20px'}}>
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{padding: '5px', width: '200px', marginRight: '10px'}}
        />
        <button onClick={fetchOrders}>Refresh</button>
      </div>

      <p>Total orders: {filteredOrders.length}</p>

      {filteredOrders.length === 0 ? (
        <div>
          <p>No orders found</p>
          {orders.length === 0 && (
            <button onClick={() => navigate('/buy/search')}>
              Start Shopping
            </button>
          )}
        </div>
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <div key={order.id} style={{
              border: '1px solid #ccc',
              padding: '15px',
              marginBottom: '15px'
            }}>
              
              <h3>Order #{order.id}</h3>
              <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
              <p>Status: <strong>{order.status.toUpperCase()}</strong></p>
              
              <hr />
              
              <h4>Product Details:</h4>
              <p>Product: {order.product_name}</p>
              <p>Quantity: {order.quantity}</p>
              <p>Price: ${order.product_price} each</p>
              <p>Total: ${order.total}</p>
              
              <h4>Delivery:</h4>
              <p>Address: {order.buyer_address}</p>
              <div className="flex justify-between items-center">
                <p className="mb-0">
                  Expected: {
                    order.status === 'delivered' ? 'Delivered' :
                    order.status === 'cancelled' ? 'Cancelled' :
                    new Date(new Date(order.created_at).getTime() + 2*24*60*60*1000).toLocaleDateString()
                  }
                </p>
                <div style={{ minWidth: '120px', textAlign: 'right' }}>
                  {order.status === 'delivered' && (
                    <button 
                      className="px-3 py-1"
                      onClick={() => alert('Review feature coming soon!')}
                    >
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
              
              <h4>Progress:</h4>
              <div>
                <p>
                  {order.status === 'pending' && '⏳ Order received, processing soon'}
                  {order.status === 'processing' && '📦 Being prepared for shipping'}
                  {order.status === 'shipped' && '🚚 On the way to you'}
                  {order.status === 'delivered' && '✅ Delivered successfully'}
                  {order.status === 'cancelled' && '❌ Order cancelled'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;