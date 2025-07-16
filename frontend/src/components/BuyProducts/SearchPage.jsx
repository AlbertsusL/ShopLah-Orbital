import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import Fuse from 'fuse.js';
import { API_BASE_URL } from "../../config/api.js";

const tokenize = (text = '') =>
  text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 1);

const buildTfidf = (products) => {
  const df = {}, vecs = {};
  products.forEach(p => {
    const tf = {};
    tokenize(p.name).forEach(tok => (tf[tok] = (tf[tok] || 0) + 1));
    vecs[p.id] = tf;
    Object.keys(tf).forEach(tok => (df[tok] = (df[tok] || 0) + 1));
  });
  const N = products.length;
  Object.values(vecs).forEach(tf => {
    Object.entries(tf).forEach(([tok, freq]) => { tf[tok] = freq * Math.log(N / (1 + df[tok])); });
  });
  return vecs;
};

const cosine = (a = {}, b = {}) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, na = 0, nb = 0;
  keys.forEach(k => { const x = a[k] || 0, y = b[k] || 0; dot += x * y; na += x * x; nb += y * y; });
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [products, setProducts] = useState([]);
  const [productRatings, setProductRatings] = useState({});
  const [tfidfVecs, setTfidfVecs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      if (response.data.success) {
        setProducts(response.data.products);
        setTfidfVecs(buildTfidf(response.data.products));
        fetchAllRatings(response.data.products);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRatings = async (productList) => {
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
    const s=[]; const full=Math.floor(r), half=r%1!==0; for(let i=0;i<full;i++) s.push(<FaStar key={i} className="text-yellow-400"/>);
    if(half) s.push(<FaStar key="h" className="text-yellow-400 opacity-50"/>);
    for(let i=0;i<5-Math.ceil(r);i++) s.push(<FaStar key={`e${i}`} className="text-gray-300"/>); return s;
  };
  const getImg = (p) => p.images?.length ? (p.images.find(i=>i.is_primary)||p.images[0]).image_url : 'https://via.placeholder.com/300x200?text=No+Image';
  const handleClick = (id) => navigate(`/buy/product/${id}`);

let filtered = products;

if (searchTerm.trim() !== '') {
  const fuse = new Fuse(products, {
    keys: ['name', 'description'],
    threshold: 0.4,   
    ignoreLocation: true,
  });
  const hits = fuse.search(searchTerm).map(r => r.item);

  filtered = hits.length > 0
    ? hits
    : products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
}

filtered = filtered.filter(p => !categoryFilter || p.category === categoryFilter);

  let similar=[];
  if(searchTerm.trim()!==''){
    const fuse = new Fuse(products,{ keys:['name'], threshold:0.4, ignoreLocation:true, includeScore:true });
    const fuseHits = fuse.search(searchTerm).map(r=>r.item);
    const sv = buildTfidf([{id:'q',name:searchTerm}])['q']||{};
    similar = fuseHits.map(p=>({...p,sim:cosine(sv, tfidfVecs[p.id]||{})}))
                     .sort((a,b)=>b.sim-a.sim)
                     .slice(0,6);
  }


  if(loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if(error)   return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><p className="text-red-600 text-xl">{error}</p><button onClick={fetchProducts} className="bg-blue-500 text-white px-4 py-2 rounded">Retry</button></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-6">Browse Products</h1>
        <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="border rounded px-3 py-2" placeholder="Search products…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          <select className="border rounded px-3 py-2" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option><option value="electronics">Electronics</option><option value="clothing">Clothing</option><option value="home">Home & Garden</option><option value="books">Books</option><option value="toys">Toys</option>
          </select>
          <button onClick={fetchProducts} className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white rounded px-4 py-2">Refresh</button>
        </div>

        <p className="mb-4 text-gray-600">Showing {filtered.length} of {products.length} products</p>

        {filtered.length===0 ? <p className="text-center text-gray-600">No products found</p> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(p=>{
                const r = productRatings[p.id]||{avgRating:0,totalReviews:0};
                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden group">
                    <div className="relative" onClick={()=>handleClick(p.id)}>
                      <img src={getImg(p)} alt={p.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform" onError={e=>{e.target.src='https://via.placeholder.com/300x200?text=No+Image';}}/>
                      <span className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full capitalize">{p.category}</span>
                      {p.stock===0&&<span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Out of Stock</span>}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-1 cursor-pointer hover:text-[#f3b15c]" onClick={()=>handleClick(p.id)}>{p.name}</h3>
                      <div className="flex items-center gap-2 mb-3"><div className="flex">{renderStars(r.avgRating)}</div><span className="text-sm text-gray-600">{r.avgRating>0?`${r.avgRating} (${r.totalReviews})`:'No reviews'}</span></div>
                      <div className="flex items-center gap-3 mb-4"><span className="text-2xl font-bold">${p.price}</span><span className="text-sm text-gray-500">Stock: {p.stock}</span></div>
                      <button onClick={()=>handleClick(p.id)} className="w-full bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white py-2 rounded-lg hover:opacity-90">View Details</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {similar.length>0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">You may also like</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similar.map(item=>(
                    <li key={item.id} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition cursor-pointer" onClick={()=>handleClick(item.id)}>
                      <img src={getImg(item)} alt={item.name} className="w-full h-40 object-cover mb-3 rounded"/>
                      <h3 className="text-lg font-medium line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">${item.price}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
