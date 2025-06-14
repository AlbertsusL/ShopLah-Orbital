import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate,useLocation } from 'react-router-dom';

const ManageProducts = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const navigate = useNavigate();
    const location = useLocation()

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

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`http://localhost:5000/api/products/user/${userDetails.ID}`);
            
            if (response.data.success) {
                const transformedProducts = response.data.products.map(product => ({
                    ...product,
                    photo_url: getProductImage(product),
                    name: product.name,
                    description: product.description,
                    category: product.category,
                    stock: product.stock || 0,
                    price: product.price ? Number(product.price).toFixed(2) : '0.00'
                }));
                setProducts(transformedProducts);
            } else {
                throw new Error(response.data.message || 'Failed to fetch products');
            }
        } catch (err) {
            console.error('API Error:', {
                message: err.message,
                url: err.config?.url,
                response: err.response?.data
            });
            setError(err.response?.data?.message || 
                   'Failed to fetch products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            const primaryImage = product.images.find(img => img.is_primary);
            return primaryImage ? primaryImage.image_url : product.images[0].image_url;
        }
        return 'https://via.placeholder.com/300x200?text=No+Image';
    };

    const handleModify = (id) => {
        navigate(`/modify/product/${id}`);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                setLoading(true);
                const response = await axios.delete(`http://localhost:5000/api/products/user/${userDetails.ID}`);
                if (response.data.success) {
                    setProducts(products.filter(product => product.id !== id));
                } else {
                    throw new Error(response.data.message || 'Failed to delete product');
                }
            } catch (err) {
                console.error('Delete error:', err);
                setError(err.response?.data?.message || 'Failed to delete product');
            } finally {
                setLoading(false);
            }
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = searchTerm === '' || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || 
            product.category.toLowerCase() === categoryFilter.toLowerCase();
        
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 text-center">
                    <div className="text-xl">Loading products...</div>
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
                        onClick={fetchProducts}
                        className="mt-4 text-white px-4 py-2 rounded"
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
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Manage Products</h1>
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:outline-none"
                        />
                        
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:outline-none"
                        >
                            <option value="">All Categories</option>
                            <option value="electronics">Electronics</option>
                            <option value="clothing">Clothing</option>
                            <option value="home">Home & Garden</option>
                            <option value="books">Books</option>
                            <option value="toys">Toys</option>
                        </select>
                        
                        <button
                            onClick={fetchProducts}
                            className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white px-4 py-2 rounded hover:opacity-90"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg shadow">
                        <p className="text-gray-600 text-lg">No products found</p>
                        {products.length === 0 ? (
                            <p className="text-gray-500 mt-2">Try adding some products first!</p>
                        ) : (
                            <p className="text-gray-500 mt-2">Try changing your search filters</p>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={product.photo_url}
                                                alt={product.name}
                                                className="h-16 w-16 object-cover rounded-md border border-gray-200"
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
                                        <td className="px-6 py-4 whitespace-nowrap capitalize">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                product.category === 'electronics' ? 'bg-blue-100 text-blue-800' :
                                                product.category === 'clothing' ? 'bg-purple-100 text-purple-800' :
                                                product.category === 'home' ? 'bg-green-100 text-green-800' :
                                                product.category === 'books' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                                            product.stock <= 5 ? 'text-red-500' :
                                            product.stock < 10 ? 'text-yellow-500' :
                                            'text-green-500'
                                        }`}>
                                            {product.stock}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            ${product.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                            <button
                                                onClick={() => handleModify(product.id)}
                                                className="text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
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
            </div>
        </div>
    );
};

export default ManageProducts;