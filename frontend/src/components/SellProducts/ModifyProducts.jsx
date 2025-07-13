import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_BASE_URL } from "../../config/api.js";

const ModifyProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.product);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error.response?.status === 404) {
        setError('Product not found');
      } else {
        setError('Failed to load product');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModify = async () => {
    try {
        setLoading(true);
        await axios.put(`${API_BASE_URL}/api/products/modify/${id}`, {
            description:product.description,
            price: product.price,
            stock: product.stock,
            id: product.id,
        });
        toast.success('Updated successfully');
        navigate('/sell/manage');
    } catch (error) {
        toast.error("Failed to update product");
        console.error('Error', error);
    }
  };

  const handleBackToSearch = () => {
    navigate('/sell/manage');
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value) || 0;
    setProduct(prev => ({
      ...prev,
      stock: newQuantity
    }));
  };

  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value) || 0;
    setProduct(prev => ({
      ...prev,
      price: newPrice
    }));
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setProduct(prev => ({
      ...prev,
      description: newDescription
    }));
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

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={handleBackToSearch}
          className="mb-4 text-white flex items-center gap-2"
        >
          ← Back to Manage Products
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
        ← Back to Manage Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
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
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm capitalize">
                {product.category}
                </span>
            </div>
            <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Description</h3>
            <textarea
                value={product.description}
                onChange={handleDescriptionChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="4"
                />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <label className="font-medium">Quantity:</label>
              <input 
                value={product.stock} 
                step='1'
                type='number'
                onChange={handleQuantityChange}
                className="border border-gray-300 rounded px-3 py-2"
              >
            </input>
        </div>

        <div className="flex items-center gap-4 mb-6">
              <label className="font-medium">Price:</label>
              <input 
                value={product.price} 
                step='0.01'
                type='number'
                onChange={handlePriceChange}
                className="border border-gray-300 rounded px-3 py-2"
                required
              >
            </input>
        </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleModify}
              disabled={product.stock === 0 || product.price === 0}
              className="w-full bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
                Update {product.name}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};


export default ModifyProducts;