import React, { useState, useEffect } from 'react'
import { FaStar } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import { API_BASE_URL } from "../../config/api.js"

function MainPageView() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      if (response.data.success) {
        setProducts(response.data.products.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].image_url;
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  const handleProductClick = (productId) => {
    navigate(`/buy/product/${productId}`);
  };

  const handleBrowseAll = () => {
    navigate('/buy/search');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className="bg-yellow-200 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to ShopLah!</h1>
          <p className="text-xl mb-8">Discover amazing products from local sellers</p>
          <button
            onClick={handleBrowseAll}
            className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white px-8 py-3 rounded-full hover:opacity-90 font-medium"
          >
            Browse All Products
          </button>
        </div>
      </div>

      {/* Products  */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>

        {loading ? (
          <div className="text-center">
            <p className="text-xl">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center">
            <p className="text-xl text-gray-600">No products available yet</p>
            <button
              onClick={() => navigate('/sell')}
              className="mt-4 bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white px-6 py-2 rounded-full"
            >
              Be the first to sell!
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs capitalize">
                      {product.category}
                    </div>
                    {/* Stock Badge */}
                    {product.stock === 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-800">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock}
                      </span>
                    </div>

                    {/* View Button */}
                    <button className="w-full mt-4 bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-2 rounded-lg hover:opacity-90 transition-opacity">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MainPageView