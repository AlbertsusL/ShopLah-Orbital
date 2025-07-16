import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { LineChart, Line } from "recharts";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { API_BASE_URL } from "../../config/api.js";

const Dashboard = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [revenueSum, setRevenueSum] = useState(0);
    const [uniqueUser, setUniqueUser] = useState(0);
    const [itemsListed, setItemsListed] = useState(0);
    const [completedOrders, setCompletedOrders] = useState(0);
    const [orderStatus, setOrderStatus] = useState([]);
    const [reviewsCount, setReviewsCount] = useState([]);
    const [categoryCount, setCategories] = useState([]);
    const [revenueMonth, setRevenueMonth] = useState([]);

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
            const response = await axios.get(`${API_BASE_URL}/api/products/dashboard/${userId}`);
            if (response.data.success) {
                setOrderStatus(response.data.orderStatus);
                setUniqueUser(response.data.uniqueUsers);
                setItemsListed(response.data.itemsListed);
                setRevenueSum(response.data.revenue);
                setCompletedOrders(response.data.completedOrders);
                setReviewsCount(response.data.review);
                setCategories(response.data.category);
                setRevenueMonth(response.data.revenueMonth);
            } else {
                setError(response.data.message || "Failed to fetch data.");
            }
        } catch (err) {
             console.error("Error fetching data:", err);
            setError("Failed to fetch data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const metrics = [
        { name: "Total Revenue", value: '$ '+ revenueSum, bg: "bg-green-100", text: "text-green-700" },
        { name: "Total Items Listed", value: itemsListed, bg: "bg-orange-100", text: "text-orange-700" },
        { name: "Completed Orders", value: completedOrders, bg: "bg-blue-100", text: "text-blue-700" },
        { name: "Unique Users", value: uniqueUser, bg: "bg-purple-100", text: "text-purple-700" },
    ];

    const COLORS = ["#f3b15c", "#95CADB","#E0B0FF"];

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`${metric.bg} ${metric.text} p-4 rounded-lg shadow-md`}
            >
              <h2 className="text-lg font-semibold">{metric.name}</h2>
              <p className="text-xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 shadow-lg rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Order Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
                        data={orderStatus.map(item => ({
                            ...item,
                            status_count: Number(item.status_count), 
                        }))}
                        dataKey="status_count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                    >
                    {orderStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart: Reviews */}
            <div className="bg-white p-6 shadow-lg rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Reviews Summary</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reviewsCount.map(item => ({
                        ...item,
                        review_score_count: Number(item.review_score_count), 
                    }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="review_score" label={{ value: "Review Score", position: "insideBottom", dy: 10 }} />
                    <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }}/>
                    <Tooltip />
                    <Bar dataKey="review_score_count" fill="#f3b15c" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Line Chart: Revenue by Month */}
            <div className="bg-white p-6 shadow-lg rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Revenue by Month</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueMonth.map(item => ({
                        ...item,
                        monthly_revenue: Number(item.monthly_revenue), 
                    }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{fontSize: 12}}/>
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="monthly_revenue" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

        {/* Horizontal Chart: Order Categories */}
            <div className="bg-white p-6 shadow-lg rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Order Categories</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                    layout="vertical"
                    data={categoryCount.map(item => ({
                        ...item,
                        count: Number(item.count), 
                    }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        type="number" 
                        label={{ value: "Count", position: "insideBottom", dy: 10 }}
                    />
                    <YAxis 
                        type="category"  
                        dataKey="category"
                        width={80} 
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f3b15c" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;