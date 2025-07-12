import axios from 'axios';
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";

const AddProductPage = () => {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserDetails(docSnap.data());
          }
        } catch (error) {
          console.error("User data load error:", error);
          if (error.code !== "permission-denied") {
            toast.error("Error loading user data");
          }
        }
      } else {
        setUserDetails(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setErrorMessage('You can upload a maximum of 5 images');
      return;
    }
    const validFiles = files.filter(file => {
      if (!file.type.match('image.*')) {
        setErrorMessage('Only image files are allowed');
        return false;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrorMessage('Image size should be less than 2MB');
        return false;
      }
      return true;
    });
    const newImagePreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newImagePreviews]);
    setImages([...images, ...validFiles]);
    setErrorMessage('');
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const imageUrls = await uploadImages();
      if(imageUrls.length === 0) {
        throw new Error('At least 1 image is required');
      }
      
      const response = await axios.post('http://localhost:5000/api/products', {
        ...productData,
        userid: userDetails?.ID || userDetails?.user,
        images: imageUrls, 
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
      });
      
      if (response.data.success) {
        setSuccessMessage("Product added successfully!");
        setProductData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
        });
        setImages([]);
        setImagePreviews([]);
      }
    } catch(error) {
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImages = async () => {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await axios.post('http://localhost:5000/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.imageUrls;
  };
  
  const buttonStyle = {
    position: "absolute",
    top: "0",
    right: "0",
    paddingTop:"10px",
    transform: "translate(-50%, 30%)",
    backgroundColor: "#ef4444",
    color: "white",
    borderRadius: "50%",
    width: "32px", 
    height: "32px", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
};

  return (
    <div className='container mx-auto px-4 py-8'style={{ position: 'relative', zIndex: '0'}}>
      <h1 className='text-2xl font-bold mb-6 text-center'>List Product</h1>
      
      {successMessage && (
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'>
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className='max-w-3xl mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                Product Name*
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={productData.name}
                onChange={handleInputChange}
                required
                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none'
              />
            </div>
            
            <div>
              <label htmlFor='description' className='block text-sm font-medium text-gray-700'>
                Description*
              </label>
              <textarea
                id='description'
                name='description'
                rows={4}
                value={productData.description}
                onChange={handleInputChange}
                required
                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none'
              />
            </div>
            
            <div>
              <label htmlFor='category' className='block text-sm font-medium text-gray-700'>
                Category*
              </label>
              <select
                id='category'
                name='category'
                value={productData.category}
                onChange={handleInputChange}
                required
                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none'
              >
                <option value=''>Select a category</option>
                <option value='electronics'>Electronics</option>
                <option value='clothing'>Clothing</option>
                <option value='home'>Home & Garden</option>
                <option value='books'>Books</option>
                <option value='toys'>Toys</option>
              </select>
            </div>
          </div>
          <div className='space-y-4'>
            <div>
              <label htmlFor='price' className='block text-sm font-medium text-gray-700'>
                Price*
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <span className='text-gray-500 sm:text-sm'>$</span>
                </div>
                <input
                  type='number'
                  id='price'
                  name='price'
                  min='0'
                  step='0.01'
                  value={productData.price}
                  onChange={handleInputChange}
                  required
                  className= 'mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 focus:outline-none'
                />
              </div>
            </div>
            
            <div>
              <label htmlFor='stock' className='block text-sm font-medium text-gray-700'>
                Stock Quantity*
              </label>
              <input
                type='number'
                id='stock'
                name='stock'
                min='0'
                value={productData.stock}
                onChange={handleInputChange}
                required
                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none'
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Product Images*
              </label>
              <p className='text-xs text-gray-500 mb-2'>Upload up to 5 images (max 2MB each)</p>
              
              <div className='mt-1 flex justify-center pb-5 border-2 border-gray-300 border-dashed rounded-md'>
                <div className='space-y-1 text-center flex flex-col items-center'>
                  <svg
                    className='mx-auto h-12 w-12 text-gray-400'
                    stroke='currentColor'
                    fill='none'
                    viewBox='0 0 48 48'
                    aria-hidden='true'
                  >
                    <path
                      strokeWidth={2}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <div className='flex text-sm text-gray-600 justify-center items-center mt-1'>
                    <label
                      htmlFor='file-upload'
                      className='relative cursor-pointer rounded-md font-medium focus-within:outline-none 
                      focus-within:ring-2 focus-within:ring-offset-2'
                    >
                      <span>Upload images</span>
                      <input
                        id='file-upload'
                        name='file-upload'
                        type='file'
                        className='sr-only'
                        multiple
                        accept='image/*'
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className='pl-1'>or drag and drop</p>
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>PNG, JPG, up to 2MB</p>
                </div>
              </div>
              {imagePreviews.length > 0 && (
                <div className='mt-4'>
                  <h3 className='text-sm font-medium text-gray-700 mb-2'>Selected Images:</h3>
                  <div className='flex flex-col space-y-4'>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className='relative group'>
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className='h-24 w-24 object-cover rounded'
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={buttonStyle}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className='mt-8 flex justify-end'>
          <button
            type='submit'
            disabled={isLoading || imagePreviews.length === 0}
            className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-amber-500 to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${(isLoading || imagePreviews.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;