import React from 'react'
import Slider from "react-slick"
import Image1 from "../../assets/phone.jpg"
import Image2 from "../../assets/mouse.jpg"
import Image3 from "../../assets/television.jpg"

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

function MainPageView() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    }
    return (
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
                                        <button>Click To Purchase</button>
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
    )
}

export default MainPageView
