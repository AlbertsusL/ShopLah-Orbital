import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaStar, FaShoppingCart, FaSearch } from "react-icons/fa";
import Image1 from "../../assets/phone.jpg";

// Sample products
const SampleProducts = () => [
    {
        id: 1,
        name: "iPhone 15 Pro",
        price: 1299,
        image: Image1,
        rating: 4.8,
        reviews: 234,
        category: "Electronics",
    },
];

const BuyProducts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
        stars.push(<FaStar key="half" className="text-yellow-400 opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />);
    }

    return stars;
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchTerm) {
      navigate(`/search`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Buy Products
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Discover amazing products at great prices
          </p>
          
          {/* Search Bar */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => navigate('/search')}
              className="w-full bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-2 px-4 rounded-lg hover:opacity-90"
            >
              Search
            </button>
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SampleProducts().map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Product Image */}
                <div className="relative overflow-hidden cursor-pointer" onClick={() => handleProductClick(product.id)}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
                    {product.category}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1 cursor-pointer hover:text-[#f3b15c]" onClick={() => handleProductClick(product.id)}>
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-gray-800">
                      ${product.price}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleProductClick(product.id)}
                      className="w-full bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-2 px-4 rounded-lg hover:opacity-90"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => toast.success("Added to cart!")}
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyProducts;