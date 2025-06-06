import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import Image1 from "../../assets/phone.jpg";
import Image2 from "../../assets/mouse.jpg";
import Image3 from "../../assets/television.jpg";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const AllProducts = [
    {
        id: 1,
        name: "iPhone 15 Pro",
        price: 1299,
        image: Image1,
        rating: 4.8,
        reviews: 234,
        category: "Electronics",
    },
    {
        id: 2,
        name: "Gaming Mouse",
        price: 89,
        image: Image2,
        rating: 4.5,
        reviews: 156,
        category: "Peripherals",
    },
    {
        id: 3,
        name: "Smart TV 55\"",
        price: 799,
        image: Image3,
        rating: 4.6,
        reviews: 89,
        category: "Electronics",
    }
  ];

  const filteredProducts = AllProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Products</h1>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#f3b15c]"
            />
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#f3b15c]"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Peripherals">Peripherals</option>
            </select>
          </div>
        </div>

        {/* Products Grid*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              
              {/* Product Image */}
              <div className="relative overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
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
                <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1 cursor-pointer hover:text-[#f3b15c]" onClick={() => navigate(`/product/${product.id}`)}>
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

                {/* Action Button */}
                <button
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="w-full bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;