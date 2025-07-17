import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { API_BASE_URL } from "../../config/api.js";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/${id}`);
      const productData = response.data.product;
      setProduct(productData);
      await fetchSellerInfo(productData.userid);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/reviews/product/${id}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
        setAvgRating(response.data.avgRating);
        setTotalReviews(response.data.totalReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchSellerInfo = async (userId) => {
    try {
      const docRef = doc(db, "Users", userId);
      const docSnap = await getDoc(docRef);
      setSeller(docSnap.data());
    } catch (error) {
      console.error('Error fetching seller:', error);
    }
  };

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
        buyerid: null,
        orderData: [
          {
            product:product, 
            quantity:quantity,
          }
        ]
      }
    });
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/products/cart`, {
        userId:seller.ID,
        product:product.id,
        quantity:quantity,
      });
      if (response.data.success) {
        toast.success(`Added ${quantity} ${product.name}(s) to cart!`);
        window.dispatchEvent(new Event("cart-updated"));
        navigate('/buy/cart');
        };
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Unable to add to Cart');
    } 
  };

  const handleBackToSearch = () => {
    navigate(-1);
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
          className="mb-4 text-blue-600"
        >
          ← Back to Search
        </button>
        <div className="text-center">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Product not found</p>
        <button onClick={handleBackToSearch} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Back to Search
        </button>
      </div>
    );
  }

  const images = getProductImages();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button 
        onClick={handleBackToSearch}
        className="mb-4 text-blue-600"
      >
        ← Back to Search
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Product Images */}
        <div>
          <img 
            src={getCurrentImage()}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg mb-4"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
            }}
          />
          
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

          {/* Category */}
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm capitalize mb-4 inline-block">
            {product.category}
          </span>

          {/* Rating Display */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {renderStars(avgRating)}
            </div>
            <span className="text-sm text-gray-600">
              {avgRating > 0 ? `${avgRating} (${totalReviews} reviews)` : 'No reviews yet'}
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
            <p className="text-gray-700 break-words max-w-[15ch]">{product.description}</p>
          </div>

          {/* Seller Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Sold by: {seller?.user}</p>
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
              className="w-full bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? 'Out of Stock' : `Buy Now - $${(product.price * quantity).toFixed(2)}`}
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

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div>
            {/* Review Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{avgRating}</div>
                  <div className="flex justify-center mb-1">
                    {renderStars(avgRating)}
                  </div>
                  <div className="text-sm text-gray-600">{totalReviews} reviews</div>
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.buyer_name}</span>
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;