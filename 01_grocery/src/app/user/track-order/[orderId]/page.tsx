"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getSocket } from "@/lib/socket";
import { ArrowLeft, MapPin, Navigation, Phone, MessageSquare, Send, ChevronUp, ChevronDown, Clock, ShieldCheck, PackageCheck } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function TrackOrder() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
  const [messageText, setMessageText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const socket = getSocket();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrderDetails();
    
    const roomId = `order_${orderId}`;
    socket.emit("joinRoom", roomId);

    // Fetch history
    axios.get(`/api/socket/get-chat/${roomId}`)
        .then(res => setMessages(res.data.messages || []))
        .catch(console.error);

    socket.on("locationUpdate", (data: any) => {
      setDeliveryLocation([data.latitude, data.longitude]);
    });

    socket.on("orderStatusUpdate", (data: any) => {
      if (data.orderId === orderId) {
        setOrder((prev: any) => ({ ...prev, status: data.status }));
      }
    });

    socket.on("receiveMessage", (data: any) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off("locationUpdate");
      socket.off("orderStatusUpdate");
      socket.off("receiveMessage");
    };
  }, [orderId]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`/api/user/my-order`);
      const foundOrder = res.data.orders.find((o: any) => o._id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
        // Initially set delivery location if available from DB
        if (foundOrder.assignedDeliveryBoy?.location?.coordinates) {
            setDeliveryLocation([
                foundOrder.assignedDeliveryBoy.location.coordinates[1],
                foundOrder.assignedDeliveryBoy.location.coordinates[0]
            ]);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getAiSuggestions = async () => {
    try {
      const res = await axios.post("/api/chat/suggest", {
        messages,
        context: "Customer tracking order. Status: " + order?.status
      });
      setSuggestions(res.data.suggestions);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = () => {
    if (!messageText.trim() || !order?.user?._id) return;
    const msg = { 
        roomId: `order_${orderId}`, 
        sender: "Customer", 
        senderId: order.user._id,
        text: messageText 
    };
    socket.emit("sendMessage", msg);
    setMessages(prev => [...prev, { sender: "Customer", text: messageText }]);
    setMessageText("");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm z-20 flex items-center gap-4 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="text-green-700" />
        </button>
        <div>
           <h1 className="font-bold text-gray-800">Track Order #{order._id.slice(-6)}</h1>
           <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{order.status}</p>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 relative z-0">
        <MapView 
            customerPosition={[order.address.latitude || 28.6139, order.address.longitude || 77.2090]}
            partnerPosition={deliveryLocation}
        />
        
        {/* Destination Marker Hint (static if no signal) */}
        {!deliveryLocation && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="bg-red-500 p-2 rounded-full shadow-lg text-white animate-bounce">
                   <MapPin size={24} />
                </div>
             </div>
        )}
      </div>

      {/* Bottom Sheet UI */}
      <motion.div 
        initial={{ y: "50%" }}
        animate={{ y: 0 }}
        className="bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-10 relative"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                 <PackageCheck size={32} />
              </div>
              <div>
                 <h3 className="font-extrabold text-xl text-gray-800">
                    {order.status === 'arrived' ? 'Arrived & Waiting for OTP' : 
                     order.status === 'outForDelivery' ? 'Out for Delivery' : 'Preparing Order'}
                 </h3>
                 <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={14} /> Estimated Arrival: 15-20 mins
                 </p>
              </div>
           </div>
        </div>

        {order.assignedDeliveryBoy && (
            <div className="bg-green-50 rounded-2xl p-4 flex items-center justify-between mb-6 border border-green-100">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm relative border border-green-200">
                     <Image src={order.assignedDeliveryBoy.image || "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_L9mTr67fcuNW9v9aaxQ1f29S5T2P3P8a.jpg"} alt="Delivery Boy" fill className="object-cover" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Your Delivery Partner</p>
                     <p className="font-bold text-gray-800">{order.assignedDeliveryBoy.name}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <a href={`tel:${order.assignedDeliveryBoy.mobile}`} className="bg-white p-3 rounded-xl shadow-sm text-green-600 hover:bg-green-100 transition-all border border-green-100">
                     <Phone size={20} />
                  </a>
                  <button onClick={() => setChatOpen(true)} className="bg-green-600 p-3 rounded-xl shadow-md text-white hover:bg-green-700 transition-all">
                     <MessageSquare size={20} />
                  </button>
               </div>
            </div>
        )}

        <div className="space-y-4">
           <div className="flex items-start gap-3">
              <MapPin className="text-red-500 shrink-0 mt-1" size={20} />
              <div>
                 <p className="text-sm font-bold text-gray-800">Delivery Address</p>
                 <p className="text-xs text-gray-500 leading-relaxed">{order.address.fullAddress}</p>
              </div>
           </div>
           
           <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                 <ShieldCheck className="text-blue-500" /> OTP Verification
              </div>
              <span className="text-lg font-black text-blue-600 tracking-widest">
                 {order.status === 'delivered' ? 'VERIFIED' : 'WAITING'}
              </span>
           </div>
        </div>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            className="fixed inset-0 z-50 bg-white flex flex-col sm:max-w-md sm:mx-auto sm:h-[80vh] sm:mt-[10vh] sm:rounded-3xl sm:shadow-2xl overflow-hidden"
          >
             <div className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Navigation size={18} />
                   </div>
                   <div>
                     <h3 className="font-bold">Chat with Partner</h3>
                     <p className="text-[10px] text-green-100 font-bold uppercase tracking-widest">AI Assisted</p>
                   </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="bg-green-700 hover:bg-green-800 p-2 rounded-full transition-colors">✕</button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
                <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest py-4">Delivery Chat Started</div>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === "Customer" ? "justify-end" : "justify-start"}`}>
                     <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${m.sender === "Customer" ? "bg-green-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"}`}>
                        <p className="text-sm">{m.text}</p>
                     </div>
                  </div>
                ))}
             </div>

             <div className="p-4 bg-white border-t border-gray-100">
                {/* AI Suggestions */}
                {suggestions.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-3 pb-2 scrollbar-hide">
                     {suggestions.map((s, i) => (
                        <button key={i} onClick={() => setMessageText(s)} className="whitespace-nowrap bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-full px-3 py-1 text-xs font-bold transition-colors">
                           ✨ {s}
                        </button>
                     ))}
                  </div>
                )}
                
                <div className="flex gap-2 relative">
                   <button onClick={getAiSuggestions} className="absolute -top-10 left-0 bg-white shadow-md border border-gray-100 rounded-full p-2 text-purple-600 hover:bg-gray-50 z-10" title="Get AI Suggestions">✨</button>
                   <input 
                     type="text" 
                     value={messageText} 
                     onChange={(e) => setMessageText(e.target.value)} 
                     placeholder="Type a message..."
                     className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                     onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                   />
                   <button onClick={sendMessage} className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-md transition-colors shrink-0">
                      <Send size={18} />
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
