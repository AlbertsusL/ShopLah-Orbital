import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Image1 from "../../assets/phone.jpg";
import Image2 from "../../assets/mouse.jpg";
import Image3 from "../../assets/television.jpg";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const SampleProducts = [
    {
        id: 1,
        name: "iPhone 15 Pro",
        price: 1299,
        image: Image1,
        rating: 4.8,
        reviews: 234,
        category: "Electronics",
        description: "It's an iphone",
        stock: 12,

    },
    {
        id: 2,
        name: "Gaming Mouse",
        price: 89,
        image: Image2,
        rating: 4.5,
        reviews: 156,
        category: "Peripherals",
        description: "Yum",
        stock: 25,
    },
    {
        id: 3,
        name: "Smart TV 55\"",
        price: 799,
        image: Image3,
        rating: 4.6,
        reviews: 89,
        category: "Electronics",
        description: "Ew",
        stock: 0,
    },
  ];

  const product = SampleProducts.find(p => p.id === parseInt(id));

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

  const handleBuyNow = () => {
    navigate('/checkout', { 
      state: { 
        product, 
        quantity,
        total: product.price * quantity
      }
    });
  };

  const handleAddToCart = () => {
    toast.success(`Added ${quantity} ${product.name}(s) to cart!`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Product Image */}
        <div>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
          

        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {product.category}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-800">
              ${product.price}
            </span>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">
                ✓ In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                ✗ Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-6">
            <label className="font-medium">Quantity:</label>
            <select 
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
              disabled={product.stock === 0}
            >
              {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? 'Out of Stock' : `Buy Now`}
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-white border border-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;