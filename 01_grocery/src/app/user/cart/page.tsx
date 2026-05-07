'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, ShoppingBasket } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { decreaseQuantity, increaseQuantity, removeItem } from '@/redux/cartSlice';

export default function CartPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { cartData, subtotal, deliveryfee, finaltotal } = useSelector((state: RootState) => state.cart);

    // Calculate subtotal dynamically
    // const subtotal = cartData.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
            {/* Header Navigation */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
                <Link href="/" className="hidden md:flex items-center text-green-700 hover:text-green-800 font-medium transition-colors">
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Home
                </Link>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2 mx-auto md:mx-0">
                    <ShoppingCart className="text-green-700" size={28} />
                    <h1 className="text-2xl md:text-3xl font-bold text-green-800">
                        Your Shopping Cart
                    </h1>
                </motion.div>
                <div className="hidden md:block w-24"></div> 
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {cartData.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='text-center py-20 bg-white rounded-2xl shadow-md border border-gray-100'
                            >
                                <ShoppingBasket className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                                <p className='text-gray-600 text-lg mb-6'>Your Cart is empty.</p>
                                <Link href="/" className='bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-all inline-block font-medium'>
                                    Continue Shopping
                                </Link>
                            </motion.div>
                        ) : (
                            cartData.map((item: any) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    // Responsive logic: Vertical on mobile, Horizontal on desktop
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-4 hover:shadow-md transition-all duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="relative w-32 h-32 md:w-20 md:h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>

                                    {/* Product Info: Centered on mobile */}
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">{item.unit}</p>
                                        <p className="text-green-700 font-bold text-xl mt-1">₹{item.price}</p>
                                    </div>

                                    {/* Actions: Stacks controls and delete on mobile */}
                                    <div className="flex flex-col items-center gap-4 md:flex-row">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full py-1.5 px-3 gap-4">
                                            <button
                                                onClick={() => dispatch(decreaseQuantity(item._id))}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-green-50 transition-all"
                                            >
                                                <Minus size={14} className="text-green-700" />
                                            </button>
                                            <span className="text-base font-bold text-gray-800 min-w-[20px] text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => dispatch(increaseQuantity(item._id))}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-green-50 transition-all"
                                            >
                                                <Plus size={14} className="text-green-700" />
                                            </button>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => dispatch(removeItem(item._id))}
                                            className="text-red-400 hover:text-red-600 transition-colors p-2"
                                        >
                                            <Trash2 size={22} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Side: Order Summary */}
                {cartData.length > 0 && (
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Order Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span>Delivery Fee</span>
                                    <span className="text-green-600 font-bold underline decoration-dotted">₹{deliveryfee.toFixed(2)}</span>
                                </div>
                                <div className="pt-3 border-t flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Total Amount</span>
                                    <span className="text-xl font-extrabold text-green-700">₹{finaltotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-full transition-all shadow-lg shadow-green-100"
                            >
                               
                                <Link href="/user/checkout">Proceed to Checkout</Link>
                            </motion.button>

                            <button
                                className="w-full mt-4 text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
                            >
                                Clear All Items
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}