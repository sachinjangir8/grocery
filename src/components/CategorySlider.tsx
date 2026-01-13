"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Milk, Wheat, Cookie, Flame, Coffee, Heart, Home } from "lucide-react";

// these cat "Dairy & Eggs", "Rice, Atta & Grains", "Snacks & Biscuits",
//   "Spices & Masalas", "Beverages & Drinks", "Personal Care",
//   "Household Essentials", "Instant & Packaged Food", "Baby & Pet Care"
const categories = [
    { name: "Dairy & Eggs", icon: <Milk />, color: "bg-yellow-100 text-yellow-700" },
    { name: "Rice, Atta & Grains", icon: <Wheat />, color: "bg-orange-100 text-orange-700" },
    { name: "Snacks & Biscuits", icon: <Cookie />, color: "bg-pink-100 text-pink-700" },
    { name: "Spices & Masalas", icon: <Flame />, color: "bg-red-100 text-red-700" },
    { name: "Beverages & Drinks", icon: <Coffee />, color: "bg-blue-100 text-blue-700" },
    { name: "Personal Care", icon: <Heart />, color: "bg-purple-100 text-purple-700" },
    { name: "Household Essentials", icon: <Home />, color: "bg-green-100 text-green-700" },
    { name: "Instant & Packaged Food", icon: <Cookie />, color: "bg-gray-100 text-gray-700" },
    { name: "Baby & Pet Care", icon: <Heart />, color: "bg-red-100 text-red-700" },
    { name: "Other", icon: <Heart />, color: "bg-gray-100 text-gray-700" },
]

export default function CategorySlider() {
    const scrollref = useRef<HTMLDivElement>(null);
    const [showleft, setShowleft] = useState<boolean>(false);
    const [showright, setShowright] = useState<boolean>(false);
    

    const scroll = (direction: "left" | "right") => {
        if (!scrollref.current) return;
        const scrollAmount = direction === "left" ? -300 : 300;
        scrollref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    const checkScroll = () => {
        if (!scrollref.current) return;
        setShowleft(scrollref.current.scrollLeft > 0);
        const { scrollLeft, scrollWidth, clientWidth } = scrollref.current;
        setShowleft(scrollLeft > 0);
        setShowright((scrollLeft + clientWidth) <= scrollWidth-5);
    };
    useEffect(() => {
        scrollref.current?.addEventListener("scroll", checkScroll);
        return () => scrollref.current?.removeEventListener("scroll", checkScroll);
    }, []);

    useEffect(() => {
        const clear=setInterval(() => {
            scroll("right");
            if(!scrollref.current)return
            const { scrollLeft, scrollWidth, clientWidth } = scrollref.current;
            if((scrollLeft + clientWidth) >= scrollWidth-5){
                scrollref.current.scrollBy({ left: -scrollWidth, behavior: "smooth" });
            }
        }, 2000);
        return () => clearInterval(clear);
    }, []);
    

    return (
        <div className="w-full max-w-6xl mx-auto py-12 px-4 bg-white rounded-xl shadow-sm my-8">
            <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
                    🛒 Shop by Category
                </h2>
            </div>

            {/* Main Container */}
            <div className="relative group">

                {/* Scrollable Area */}
                <div
                    ref={scrollref}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth no-scrollbar px-2 py-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hides scrollbar in Firefox/IE
                >
                    {categories.map((cat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: false }}
                            className={`min-w-[160px] h-[180px] ${cat.color} rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-white/50 flex-shrink-0`}
                        >
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                {cat.icon}
                            </div>
                            <span className="font-semibold text-sm leading-tight">
                                {cat.name}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                {/* Left Button */}
                {showleft && (
                <button
                    onClick={() => scroll("left")}
                    className="absolute top-1/2 -left-4 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg text-emerald-600 hover:bg-emerald-50 transition-colors z-10 border border-emerald-100 "
                >
                    <ChevronLeft size={24} />
                </button>
                )}

                {/* Right Button */}
                {showright && (
                <button
                    onClick={() => scroll("right")}
                    className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg text-emerald-600 hover:bg-emerald-50 transition-colors z-10 border border-emerald-100 "
                >
                    <ChevronRight size={24} />
                </button>

                )}
            </div>
        </div>
    );
}