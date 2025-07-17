import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate,useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from "../../config/api.js";

const Cart = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
            fetchCartItems(userDetails.ID);
        }
    }, [userDetails]);
    const fetchCartItems = async (userId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/products/cart/${userId}`);
            if (response.data.success) {
                setCartItems(response.data.cart);

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

    const handleViewItem = async (productId) => {
        navigate(`/buy/product/${productId}`);
    }

    const handleDelete = async (cartId) => {
            if (window.confirm('Are you sure you want to delete this product from cart?')) {
                try {
                    setLoading(true);
                    const response = await axios.delete(`${API_BASE_URL}/api/products/cart/${cartId}`, {
                    });
                    if (response.data.success) {
                        toast.success("Product successfully deleted!");
                        window.dispatchEvent(new Event("cart-updated"));
                        fetchCartItems(userDetails.ID);
                    } else {
                        throw new Error(response.data.message || 'Failed to delete product from cart');
                    }
                } catch (err) {
                    console.error('Delete error:', err);
                    setError(err.response?.data?.message || 'Failed to delete product from cart');
                } finally {
                    setLoading(false);
                }
            }
        };

    const handleBuyNow = () => {
        const orderData = cartItems.map(item => ({
            product: item,
            quantity: item.cart_quantity,
        }));

        navigate('/checkout', {
            state: {
                buyerid: userDetails.ID,
                orderData
            }
        });
    };


    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            const primaryImage = product.images.find(img => img.is_primary);
            return primaryImage ? primaryImage.image_url : product.images[0].image_url;
        }
        return 'https://via.placeholder.com/300x200?text=No+Image';
    };
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">View Cart</h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg shadow">
                        <p className="text-gray-600 text-lg">No products in Cart</p>  
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {cartItems.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={getProductImage(product)}
                                                alt={product.name}
                                                className="h-20 w-20 object-cover rounded-md border border-gray-200"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/150';
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                            {product.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            ${product.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            {product.cart_quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                            <button
                                                onClick={() => handleViewItem(product.id)}
                                                className="text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                            >
                                                View Item
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.cart_id)}
                                                className="text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-6 max-w-4xl mx-auto bg-white rounded-lg shadow px-6 py-4 flex flex-col md:flex-row items-center justify-between">
                    <div className="text-lg font-semibold text-gray-800">Total: ${cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.cart_quantity,0).toFixed(2)}
                    </div>
                <button
                    onClick={handleBuyNow}
                    className="mt-4 md:mt-0 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
                >Proceed to Checkout</button>
            </div>
        </div>
    )
}

export default Cart;