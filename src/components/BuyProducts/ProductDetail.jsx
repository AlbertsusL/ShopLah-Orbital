import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const response = await axios.get(`http://localhost:5000/api/products/${id}`);
    const productData = response.data.product;
    setProduct(productData);
    
    await fetchSellerInfo(productData.userid);
    setLoading(false);
  };

  const fetchSellerInfo = async (userId) => {
    const docRef = doc(db, "Users", userId);
    const docSnap = await getDoc(docRef);
    setSeller(docSnap.data());
  };

  const renderStars = (rating = 4.5) => {
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
        total: product.price * quantity,
      }
    });
  };

  const handleAddToCart = () => {
    toast.success(`Added ${quantity} ${product.name}(s) to cart!`);
  };

  const handleBackToSearch = () => {
    navigate('/buy/search');
  };

  const getProductImages = () => {
    if (product && product.images && product.images.length > 0) {
      return product.images.map(img => img.image_url);
    }
    return ['https://via.placeholder.com/400x400?text=No+Image'];
  };

  const getCurrentImage = () => {
    const images = getProductImages();
    return images[selectedImageIndex] || images[0];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={handleBackToSearch}
          className="mb-4 text-white flex items-center gap-2"
        >
          ← Back to Search
        </button>
        <div className="text-center">
          <div className="text-xl">Loading product...</div>
        </div>
      </div>
    );
  }

  const images = getProductImages();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button 
        onClick={handleBackToSearch}
        className="mb-4 text-white flex items-center gap-2"
      >
        ← Back to Search
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Product Images */}
        <div>
          {/* Main Image */}
          <img 
            src={getCurrentImage()}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg mb-4"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
            }}
          />
          
          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={`w-20 h-20 object-cover rounded cursor-pointer transition-all ${
                    selectedImageIndex === index 
                      ? 'ring-2 ring-amber-500 opacity-100' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm capitalize">
              {product.category}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {renderStars(4.5)}
            </div>
            <span className="text-sm text-gray-600">
              4.5 (New Product)
            </span>
          </div>

          {/* Price */}
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-800">
              ${parseFloat(product.price).toFixed(2)}
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
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Seller Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Sold by: {seller?.user}
            </p>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <label className="font-medium">Quantity:</label>
              <select 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2"
              >
                {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
              <span className="text-gray-600">
                Total: ${(product.price * quantity).toFixed(2)}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {product.stock === 0 ? 'Out of Stock' : `Buy Now - $${(product.price * quantity).toFixed(2)}`}
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-white border border-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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