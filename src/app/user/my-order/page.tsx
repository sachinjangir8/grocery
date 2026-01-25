"use client";
import React, { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, MapPin, Package, ChevronDown, ChevronUp, Loader2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants for staggered list entry
const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const OrderCard = ({ order }: { order: any }) => {
  const [showItems, setShowItems] = useState(false);

  return (
    <motion.div 
      variants={cardVariants}
      layout
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6"
    >
      {/* Header Info: Order ID, Date and Status Badges */}
      <div className="p-5 flex justify-between items-start">
        <div>
          <h3 className="text-green-700 font-bold text-lg flex items-center gap-2">
            order <span className="text-green-600 font-medium">#{order._id.slice(-6)}</span>
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Payment Status Badge */}
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
            order.isPaid ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-400'
          }`}>
            {order.isPaid ? 'Paid' : 'Unpaid'}
          </span>
          {/* Delivery Status Badge */}
          <span className="bg-yellow-50 text-yellow-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
            {order.status}
          </span>
        </div>
      </div>

      {/* Details Section: Payment Method and Full Address */}
      <div className="px-5 pb-4 space-y-3">
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <CreditCard size={16} className="text-green-600" />
          <span className="uppercase">{order.paymentMethod} Payment</span>
        </div>
        <div className="flex items-start gap-3 text-gray-500 text-sm">
          <MapPin size={16} className="text-green-600 mt-0.5" />
          <span className="flex-1 leading-tight">
            {order.address.city}, {order.address.state}, {order.address.pincode}
          </span>
        </div>
      </div>

      {/* Expandable Order Items Section */}
      <div className="border-t border-gray-50">
        <motion.button 
          whileTap={{ backgroundColor: "rgba(0,0,0,0.02)" }}
          onClick={() => setShowItems(!showItems)}
          className="w-full flex justify-between items-center p-4 text-green-700 font-medium text-sm"
        >
          <div className="flex items-center gap-2">
            <Package size={18} />
            <span>{showItems ? 'Hide Order Items' : `View ${order.items.length} Items`}</span>
          </div>
          <motion.div animate={{ rotate: showItems ? 180 : 0 }}>
            <ChevronDown size={18} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showItems && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-gray-50/50"
            >
              <div className="p-4 space-y-3">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-gray-50 rounded-lg p-1">
                       {/* Ensure item.image exists in your items array objects */}
                      <Image src={item.image || '/placeholder-grocery.png'} alt={item.name} fill className="object-contain" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-800">{item.name}</h4>
                      <p className="text-xs text-gray-400">{item.quantity} x {item.unit || 'unit'}</p>
                    </div>
                    <div className="text-gray-800 font-bold text-sm">₹{item.price}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info: Final Total Amount */}
      <div className="p-4 border-t border-gray-50 flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 text-green-600 font-medium">
          <Package size={16} />
          <span>Delivery: <span className="font-bold">{order.status}</span></span>
        </div>
        <div className="font-bold text-gray-800">
          Total: <span className="text-green-700 text-lg">₹{order.totalAmount}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/user/my-order');
        // Based on your console log, the data is inside response.data.orders
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 text-green-700">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 size={40} />
        </motion.div>
        <span className="font-medium animate-pulse">Fetching your orders...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="text-green-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
      </div>

      {orders.length > 0 ? (
        <motion.div variants={listVariants} initial="hidden" animate="visible">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <ShoppingBag className="mx-auto text-gray-200 mb-4" size={64} />
          <p className="text-gray-400">You haven't placed any orders yet.</p>
        </div>
      )}
    </div>
  );
}