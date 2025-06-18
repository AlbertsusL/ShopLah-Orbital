import React from 'react'
import Slider from "react-slick"
import Image1 from "../../assets/phone.jpg"
import Image2 from "../../assets/mouse.jpg"
import Image3 from "../../assets/television.jpg"
import { FaStar, FaShoppingCart } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

const SlideData = () => [
    {
        id: 1, 
        image: Image1,
        subtitle: "Phone",
        title:  "Apple iPhone",
        description: "A brand new iPhone at a discount"
    }, 
    {
        id: 2, 
        image: Image2,
        subtitle: "Accessories",
        title:  "Mouse",
        description: "Most advanced mouse in 2025"
    }, 
    {
        id: 3, 
        image: Image3,
        subtitle: "Homeware",
        title:  "Television",
        description: "Clearest Television in town"
    }
];

// Sample product
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

function MainPageView() {
    const navigate = useNavigate();
    
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
    }


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
        <div className='min-h-screen bg-gray-50' style={{ position: 'relative', zIndex: '-1'}}>
            {/* Hero Slider Section */}
            <div className='container'>
                <div className="overflow-hidden rounded-3xl min-h-[300px]
                sm:min-h-[350px] bg-yellow-200 flex justify-center
                items-center">
                    <div className='container pb-8 sm:pb-0'>
                    {/* section */}
                    <Slider {...settings}>
                        {SlideData().map((data) => (
                            <div key={data.id}>
                                {/*Content*/}
                                <div className='grid grid-cols-1 sm:grid-cols-2'>
                                    <div className='flex flex-col justify-center 
                                    gap-5 sm:pl-3 pt-12 sm:pt-0 text-center sm:text-left
                                    order-2 sm:order-1 relative z-10'>
                                        <h1 className='text-2xl sm:text-5xl font-bold'>
                                            {data.subtitle}</h1>
                                        <h2 className='text-2xl sm:text-3xl font-sans'>
                                            {data.title}</h2>
                                        <text>{data.description}</text>
                                        <div>
                                            <button className="bg-gradient-to-r from-[#f3b15c] to-[#ed8888] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity font-medium">
                                                Click To Purchase
                                            </button>
                                        </div>
                                    </div>
                                    {/*Image*/}
                                    <div className=''>
                                        <div>
                                            <img src={data.image} alt=''
                                            className='w-[320px] h-[400px] sm:h-[300px]
                                            sm:scale-120 lg:scale-150 object-contain
                                            mx-auto'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="container mx-auto px-4 py-16">
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {SampleProducts().map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            {/* Product Image */}
                            <div className="relative overflow-hidden">
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
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
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
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MainPageView