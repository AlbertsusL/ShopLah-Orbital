import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from "../../config/api.js";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const Favourite = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [favourites, setFavourites] = useState([]);
  const [productRatings, setProductRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userDetails, setUserDetails] = useState(null);

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

  useEffect(() => {
    if (userDetails && userDetails.ID) {
      fetchFavourites();
    }
  }, [userDetails]);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/api/products/favourites/${userDetails.ID}`);
      setFavourites(response.data.favourites);
      fetchAllRatings(response.data.favourites);
    } catch (err) {
      console.error('API Error:', {
        message: err.message,
        url: err.config?.url,
        response: err.response?.data
      });
      setError(err.response?.data?.message ||
        'Failed to fetch favourites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRatings = async (productList) => {
    if (!Array.isArray(productList)) return;
    const ratings = {};
    try {
      const ratingPromises = productList.map(async (product) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/orders/reviews/product/${product.id}`);
          if (response.data.success) {
            ratings[product.id] = {
              avgRating: response.data.avgRating,
              totalReviews: response.data.totalReviews
            };
          } else {
            ratings[product.id] = { avgRating: 0, totalReviews: 0 };
          }
        } catch (error) {
          ratings[product.id] = { avgRating: 0, totalReviews: 0 };
        }
      });

      await Promise.all(ratingPromises);
      setProductRatings(ratings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const renderStars = (r) => {
    const s = [];
    const full = Math.floor(r), half = r % 1 !== 0;
    for (let i = 0; i < full; i++) s.push(<FaStar key={i} className="text-yellow-400" />);
    if (half) s.push(<FaStar key="h" className="text-yellow-400 opacity-50" />);
    for (let i = 0; i < 5 - Math.ceil(r); i++) s.push(<FaStar key={`e${i}`} className="text-gray-300" />);
    return s;
  };

  const getImg = (p) => p.images?.length ? (p.images.find(i => i.is_primary) || p.images[0]).image_url : 'https://via.placeholder.com/300x200?text=No+Image';
  const handleClick = (id) => navigate(`/buy/product/${id}`);

  let filtered = Array.isArray(favourites) ? favourites : [];
  filtered = filtered.filter(p =>
    (!categoryFilter || p.category === categoryFilter) &&
    (!searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-600 text-xl">{error}</p>
      <button onClick={fetchFavourites} className="bg-blue-500 text-white px-4 py-2 rounded">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-6">Favourites</h1>
        <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="border rounded px-3 py-2" placeholder="Search products…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <select className="border rounded px-3 py-2" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Garden</option>
            <option value="books">Books</option>
            <option value="toys">Toys</option>
          </select>
          <button onClick={fetchFavourites} className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white rounded px-4 py-2">Refresh</button>
        </div>

        <p className="mb-4 text-gray-600">Showing {filtered.length} of {favourites.length} products</p>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-600">No products found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(p => {
              const r = productRatings[p.id] || { avgRating: 0, totalReviews: 0 };
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden group">
                  <div className="relative" onClick={() => handleClick(p.id)}>
                    <img src={getImg(p)} alt={p.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform" onError={e => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }} />
                    <span className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full capitalize">{p.category}</span>
                    {p.stock === 0 && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Out of Stock</span>}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-1 cursor-pointer hover:text-[#f3b15c]" onClick={() => handleClick(p.id)}>{p.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">{renderStars(r.avgRating)}</div>
                      <span className="text-sm text-gray-600">{r.avgRating > 0 ? `${r.avgRating} (${r.totalReviews})` : 'No reviews'}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl font-bold">${p.price}</span>
                      <span className="text-sm text-gray-500">Stock: {p.stock}</span>
                    </div>
                    <button onClick={() => handleClick(p.id)} className="w-full bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-2 rounded-lg hover:opacity-90">View Details</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourite;
