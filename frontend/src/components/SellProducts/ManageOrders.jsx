import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from "../../config/api.js";

const ManageOrders = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
            setError("User document not found");
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          setError("Error loading user data.");
        }
      } else {
        setUserDetails(null);
        setError("User not authenticated");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userDetails && userDetails.ID) {
      fetchOrders();
    }
  }, [userDetails]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/api/orders/seller/${userDetails.ID}`);

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('API Error:', {
        message: err.message,
        url: err.config?.url,
        response: err.response?.data
      });
      setError(err.response?.data?.message ||
        'Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}!`);
        fetchOrders();
      } else {
        throw new Error(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-xl">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-600 text-xl">{error}</div>
          <button
            onClick={fetchOrders}
            className="mt-4 bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Manage Orders</h1>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by buyer name, email, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={fetchOrders}
              className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white px-4 py-2 rounded hover:opacity-90"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Orders Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">No orders found</p>
            {orders.length === 0 ? (
              <p className="text-gray-500 mt-2">No orders received yet!</p>
            ) : (
              <p className="text-gray-500 mt-2">Try changing your search filters</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Order Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Order ID #{order.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Product:</span> {order.product_name}</p>
                      <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                      <p><span className="font-medium">Total:</span> <span className="text-lg font-bold text-green-600">${parseFloat(order.total).toFixed(2)}</span></p>
                      <p><span className="font-medium">Order Date:</span> {formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h4 className="text-md font-semibold text-gray-800 border-b pb-1">Customer Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {order.buyer_name}</p>
                      <p><span className="font-medium">Email:</span> {order.buyer_email}</p>
                      <p><span className="font-medium">Phone:</span> {order.buyer_phone || 'Not provided'}</p>
                      <p><span className="font-medium">Delivery Address:</span></p>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        {order.buyer_address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-600 mr-2">Update Status:</span>
                    
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Mark as Processing
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    
                    {order.status === 'processing' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
                        >
                          Mark as Shipped
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    
                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <span className="text-sm text-gray-500 italic">
                        Order is {order.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;