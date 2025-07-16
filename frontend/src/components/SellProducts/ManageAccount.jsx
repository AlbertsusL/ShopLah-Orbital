import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { API_BASE_URL } from "../../config/api.js";

const ManageAccount = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingSum, setPendingSum] = useState(0);
  const [revenueSum, setRevenueSum] = useState(0);

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
        } catch (err) {
          console.error("Error loading user data:", err);
          setError("Error loading user data.");
        }
      } else {
        setError("User not authenticated");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userDetails?.ID) {
      fetchOrders(userDetails.ID);
    }
  }, [userDetails]);

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/products/order/${userId}`);
      if (response.data.success) {
        setOrders(response.data.order);
        setPendingSum(response.data.totalSum);
        setRevenueSum(response.data.revenueSum)
      } else {
        setError(response.data.message || "Failed to fetch orders.");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6 text-center">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow-lg rounded-2xl p-4 text-center">
          <h2 className="text-lg font-semibold">Revenue Earned</h2>
          <p className="text-2xl font-bold text-green-600">${revenueSum}</p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-4 text-center">
          <h2 className="text-lg font-semibold">Pending Amount</h2>
          <p className="text-2xl font-bold text-orange-500">${pendingSum}</p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Transactions</h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No transactions found.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Product</th>
                <th className="py-2 px-4">Sales</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{order.date.split('T')[0]}</td>
                  <td className="py-2 px-4">{order.name}</td>
                  <td className="py-2 px-4">${order.total}</td>
                  <td className="py-2 px-4">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageAccount;