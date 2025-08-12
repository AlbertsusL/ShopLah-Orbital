import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from "../../config/api.js";

const WriteReview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      axios.get(`${API_BASE_URL}/api/orders/reviews/order/${order.id}`)
        .then(response => {
          if (response.data.success && response.data.review) {
            setRating(response.data.review.rating);
            setComment(response.data.review.comment);
          }
        })
        .catch(error => {
          console.log('No existing review found');
        });
    }
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders/reviews`, {
        orderId: order.id,
        productId: order.product_id,
        buyerName: order.buyer_name,
        buyerEmail: order.buyer_email,
        rating: rating,
        comment: comment.trim(),
        productName: order.product_name
      });

      if (response.data.success) {
        toast.success('Review submitted!');
        navigate('/buy/myorders');
      }
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Order not found</p>
        <button 
          onClick={() => navigate('/buy/myorders')}
          className="!mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <button
        onClick={() => navigate('/buy/myorders')}
        className="!mb-4 text-blue-600"
      >
        ← Back to Orders
      </button>

      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-4">Write Review</h1>
        
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="font-medium">{order.product_name}</p>
          <p className="text-sm text-gray-600">Order #{order.id}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Stars */}
          <div className="mb-4">
            <label className="block mb-2">Rating:</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl"
                >
                  <FaStar
                    className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label htmlFor="review-comment" className="block mb-2">Your Review:</label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review here..."
              className="w-full border rounded px-3 py-2"
              rows={4}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/buy/myorders')}
              className="flex-1 bg-gray-300 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 text-white py-2 rounded disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteReview;