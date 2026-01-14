"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Box, ArrowRight } from "lucide-react";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Animated Success Checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.1 
          }}
          className="flex justify-center"
        >
          <CheckCircle2 size={100} className="text-green-600" strokeWidth={1.5} />
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="text-3xl md:text-4xl font-black text-green-800 tracking-tight">
            Order Placed Successfully
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Thank you for shopping with us! Your order has been placed <br className="hidden md:block" />
            and is being processed. You can track its progress in your{" "}
            <Link href="/user/my-orders" className="text-green-700 font-bold hover:underline">
              My Orders
            </Link>{" "}
            section.
          </p>
        </motion.div>

        {/* Package Icon Box */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center py-4"
        >
          <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
            <Box size={60} className="text-green-600" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Link href="/user/my-orders">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-xl shadow-green-100 flex items-center gap-2 mx-auto"
            >
              Go to My Orders <ArrowRight size={18} />
            </motion.button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}