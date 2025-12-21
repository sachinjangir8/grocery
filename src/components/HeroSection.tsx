"use client";
import { Leaf, ShoppingBasket, Smartphone, Truck } from "lucide-react";
import { AnimatePresence } from "motion/react";
import React, { useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";

function HeroSection() {
  const slides = [
    {
      id: 1,
      Icon: <Leaf size={48} className="text-green-500 mb-4" />,
      title: "Fresh Groceries Delivered to Your Doorstep",
      description:
        "Experience the convenience of online grocery shopping with our wide selection of fresh produce, pantry staples, and household essentials.",
      btntxt: "Shop Now",
      bg: "https://www.istockphoto.com/photos/fresh-vegetables",
    },
    {
      id: 2,
      Icon: <Truck size={48} className="text-green-500 mb-4" />,
      title: "Quality You Can Trust",
      description:
        "We source our products from trusted suppliers to ensure you receive only the best quality groceries for you and your family.",
      btntxt: "Browse Products",
      bg: "https://cdn.britannica.com/17/196817-159-9E487F15/vegetables.jpg",
    },
    {
      id: 3,
      Icon: <Smartphone size={48} className="text-green-500 mb-4" />,
      title: "Fast and Reliable Delivery",
      description:
        "Get your groceries delivered quickly and efficiently with our reliable delivery service, right to your doorstep.",
      btntxt: "Get Started",
      bg: "https://t4.ftcdn.net/jpg/05/37/04/61/360_F_537046123_s8JVn2NrClPQDOryhSm8jonYZPfIzPRX.jpg",
    },
  ];
  const [currentSlide, setCurrentSlide] = React.useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="relative w-[98%] mx-auto min-h-3/4 overflow-hidden rounded-lg shadow-lg mt-25 ">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[currentSlide]?.bg}
            fill
            alt="slide"
            priority
          ></Image>
          <div className="absolute inset-0 bg-black/50 backdrop-blue-[1px]" />
        </motion.div>
      </AnimatePresence>
      <div className="absoluten inset-0 flex items-center justify-center text-center text-white px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="flex flex-col items-center justify-center gap-6 max-w-3xl"
        >
          <div
            className="bg-white/10 backdrop-blur-md p-8 rounded-full shadow-lg flex flex-col
             items-center justify-center gap-4 mt-25"
          >
            {slides[currentSlide].Icon}
          </div>
          <h1
            className="text-3xl sm:text-2xl md:text-3xl font-extrabold tracking-tight
                 drop-shadow-lg text-white"
          >
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg sm:text-2xl text-gray-400 max-w-2xl tracking-tight drop-shadow-lg">
            {slides[currentSlide].description}
          </p>
          <motion.button
            className="mb-40 bg-black text-green-700 hover:bg-green-400 px-8 py-3 tracking-tight drop-shadow-lg
  rounded-full font-semibold shadow-lg transition-all duration-300 flex items-center gap-2"
            whileHover={{scale:1.09}}
            whileTap={{scale:1.9}}
            transition={{duration:0.2}}
          >
            <ShoppingBasket className="w-5 h-5" />
            {slides[currentSlide].btntxt}
          </motion.button>
    
        </motion.div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-1/2 flex gap-3" >
        {slides.map((_, index) => (
  <button
    key={index}
    className={`w-3 h-3 rounded-full transition-all ${
      index === currentSlide ? "bg-white w-6" : "bg-white/50"
    }`}
  />
))}
      </div>
    </div>
  );
}

export default HeroSection;
