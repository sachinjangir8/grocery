"use client"
import { IOrder } from '@/model/order.model'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronDown,
  Package,
  MapPin,
  Phone,
  User,
  CreditCard,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

function Manageorders() {
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getorders = async () => {
      try {
        const res = await axios('/api/admin/get-orders')
        setOrders(res.data.orders)
      } catch (error) {
        console.log("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }
    getorders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-[#f8fafc] p-4 md:p-8"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-4 mb-8 border-b pb-4 border-gray-200"
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
          >
            <ArrowLeft className="text-green-700" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-800">Manage Orders</h1>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.12 }
            }
          }}
          className="space-y-6"
        >
          {orders.map((order: any) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

function OrderCard({ order }: { order: any }) {
  const [showItems, setShowItems] = useState(false)

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.97 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 80 }
        }
      }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Top Bar */}
      <div className="p-5 flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Package className="text-green-600" size={20} />
            <h3 className="font-bold text-gray-800 text-lg">
              Order <span className="text-green-600">#{order._id.slice(-6)}</span>
            </h3>
            <span className="bg-yellow-50 text-yellow-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase border border-yellow-100">
              {order.status}
            </span>
          </div>
          <p className="text-gray-400 text-xs px-8">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Animated Paid / Unpaid */}
          <AnimatePresence mode="wait">
            <motion.span
              key={order.isPaid ? "paid" : "unpaid"}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border flex items-center gap-2 ${
                order.isPaid
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "bg-red-50 text-red-500 border-red-200"
              }`}
            >
              <motion.div
                animate={{
                  scale: order.isPaid ? [1, 1.5, 1] : 1,
                  backgroundColor: order.isPaid ? "#22c55e" : "#ef4444"
                }}
                transition={{ duration: 0.6 }}
                className="w-2 h-2 rounded-full"
              />
              {order.isPaid ? "Paid" : "Unpaid"}
            </motion.span>
          </AnimatePresence>

          <select className="text-xs border rounded-lg p-1 bg-gray-50 outline-none focus:ring-1 focus:ring-green-500">
            <option>PENDING</option>
            <option>SHIPPED</option>
            <option>DELIVERED</option>
          </select>
        </div>
      </div>

      {/* Customer & Address */}
      <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-gray-600 text-sm">
            <User size={16} className="text-green-600" />
            <span className="font-medium">{order.address.fullName}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600 text-sm">
            <Phone size={16} className="text-green-600" />
            <span>{order.address.mobile}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-3 text-gray-600 text-sm">
            <MapPin size={16} className="text-green-600 mt-1" />
            <span>
              {order.address.city}, {order.address.state}, {order.address.pincode}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-600 text-sm">
            <CreditCard size={16} className="text-green-600" />
            <span className="uppercase">{order.paymentMethod} Payment</span>
          </div>
        </div>
      </div>

      {/* Items Toggle */}
      <div className="border-t border-gray-50">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowItems(!showItems)}
          className="w-full flex justify-between items-center p-4 text-gray-600 hover:text-green-700 text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <Package size={18} className="text-green-600" />
            <span>{showItems ? 'Hide Items' : `View ${order.items.length} Items`}</span>
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
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-4"
                  >
                    <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border">
                      <Image
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-800">{item.name}</h4>
                      <p className="text-xs text-gray-400">
                        {item.quantity} x {item.unit}
                      </p>
                    </div>
                    <div className="text-gray-800 font-bold text-sm">₹{item.price}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          Delivery: <span className="font-bold lowercase">{order.status}</span>
        </div>
        <div className="text-gray-800 font-bold">
          Total: <span className="text-green-700 text-xl ml-1">₹{order.totalAmount}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default Manageorders
