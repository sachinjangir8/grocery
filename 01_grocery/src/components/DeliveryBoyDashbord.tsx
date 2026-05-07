"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getSocket } from "@/lib/socket";
import { MapPin, Navigation, PackageCheck, Send, CheckCircle2, MessageSquare, ShieldCheck, ShoppingBag, Clock, LogOut } from "lucide-react";
import dynamic from "next/dynamic";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import GeoUpdater from "./GeoUpdater";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function DeliveryBoyDashbord() {
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [availableBroadcasts, setAvailableBroadcasts] = useState<any[]>([]);
  const [incomingBroadcast, setIncomingBroadcast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
  const [messageText, setMessageText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const socket = getSocket();

  useEffect(() => {
    fetchActiveAssignment();
    fetchStats();

    socket.on("deliveryAssignment", (data: any) => {
      setIncomingBroadcast(data);
    });

    socket.on("receiveMessage", (data: any) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on("orderStatusUpdate", (data: any) => {
        if (data.status === 'delivered') fetchStats();
    });

    return () => {
      socket.off("deliveryAssignment");
      socket.off("receiveMessage");
      socket.off("orderStatusUpdate");
    };
  }, []);

  useEffect(() => {
    if (activeAssignment?.order?._id) {
        const roomId = `order_${activeAssignment.order._id}`;
        socket.emit("joinRoom", roomId);
        
        axios.get(`/api/socket/get-chat/${roomId}`)
            .then(res => setMessages(res.data.messages || []))
            .catch(console.error);
    }
  }, [activeAssignment]);

  const fetchActiveAssignment = async () => {
    try {
      const res = await axios.get("/api/delivery/active-assignment");
      if (res.data.assignment) {
        setActiveAssignment(res.data.assignment);
        setAvailableBroadcasts([]);
      } else {
        setActiveAssignment(null);
        setAvailableBroadcasts(res.data.availableBroadcasts || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("/api/delivery/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const acceptAssignment = async (assignmentId: string) => {
    try {
      await axios.post("/api/delivery/accept-assignment", { assignmentId });
      setIncomingBroadcast(null);
      fetchActiveAssignment();
      setActiveTab("active");
    } catch (err) {
      alert("Error or already accepted by someone else");
      setIncomingBroadcast(null);
    }
  };

  const sendOtp = async () => {
    try {
      await axios.post("/api/delivery/send-otp", { orderId: activeAssignment.order._id });
      await axios.post(`/api/admin/update-order-status/${activeAssignment.order._id}`, { status: "arrived" });
      setOtpSent(true);
      alert("OTP Sent to customer email & Status updated to Arrived");
    } catch (err) {
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      await axios.post("/api/delivery/verify-otp", { orderId: activeAssignment.order._id, otp });
      alert("Delivery Completed!");
      setActiveAssignment(null);
      setOtpSent(false);
      setOtp("");
      fetchStats();
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  const getAiSuggestions = async () => {
    try {
      const res = await axios.post("/api/chat/suggest", {
        messages,
        context: "Delivery to " + activeAssignment?.order?.address?.fullAddress
      });
      setSuggestions(res.data.suggestions);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = () => {
    if (!messageText.trim() || !activeAssignment?.order?._id) return;
    const msg = { 
        roomId: `order_${activeAssignment.order._id}`, 
        sender: "Delivery", 
        senderId: activeAssignment.assignedTo,
        text: messageText 
    };
    socket.emit("sendMessage", msg);
    setMessages(prev => [...prev, { sender: "Delivery", text: messageText }]);
    setMessageText("");
  };

  if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       <GeoUpdater userId={activeAssignment?.assignedTo} activeOrderId={activeAssignment?.order?._id} />
       <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-30 shadow-sm flex justify-between items-center">
          <h1 className="text-xl font-black text-green-700 tracking-tighter">PARTNER CORE</h1>
          <div className="flex gap-2">
             <button 
                onClick={() => { fetchActiveAssignment(); fetchStats(); }} 
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all"
                title="Refresh Data"
             >
                <Clock size={20} />
             </button>
             <button 
                onClick={() => setActiveTab("dashboard")} 
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "dashboard" ? "bg-green-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
             >
                Dashboard
             </button>
             <button 
                onClick={() => {
                   localStorage.removeItem("token");
                   import("next-auth/react").then(m => m.signOut({ callbackUrl: "/login" }));
                }}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                title="Logout"
             >
                <LogOut size={20} />
             </button>
             <button 
                onClick={() => setActiveTab("active")} 
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all relative ${activeTab === "active" ? "bg-green-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
             >
                Active {activeAssignment && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
             </button>
          </div>
       </div>

       <div className="flex-1 p-4 md:p-8">
          <AnimatePresence mode="wait">
             {activeTab === "dashboard" ? (
                <motion.div 
                    key="dash" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 max-w-5xl mx-auto"
                >
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Completed</p>
                         <h3 className="text-3xl font-black text-gray-900">{stats?.totalCompleted || 0}</h3>
                      </div>
                      <div className="bg-green-600 p-6 rounded-3xl shadow-lg shadow-green-100 text-white">
                         <p className="text-[10px] font-black text-green-200 uppercase tracking-widest mb-1">Total Earnings</p>
                         <h3 className="text-3xl font-black">₹{stats?.totalEarnings || 0}</h3>
                      </div>
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hidden md:block">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg. per order</p>
                         <h3 className="text-3xl font-black text-gray-900">₹40</h3>
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100">
                      <h3 className="font-black text-gray-800 mb-6">Earnings History (7 Days)</h3>
                      <div className="h-64 w-full">
                         {stats?.chartData ? (
                            <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={stats.chartData}>
                                  <defs>
                                     <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                                     </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dx={-10} />
                                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                  <Area type="monotone" dataKey="earnings" stroke="#16a34a" strokeWidth={4} fillOpacity={1} fill="url(#colorEarn)" />
                               </AreaChart>
                            </ResponsiveContainer>
                         ) : (
                            <div className="flex h-full items-center justify-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">No history found</div>
                         )}
                      </div>
                   </div>

                   {/* Available Broadcasts / Incoming Requests */}
                   {availableBroadcasts.length > 0 && (
                      <div className="space-y-4">
                         <h3 className="font-black text-gray-800 flex items-center gap-2">
                            <Navigation size={18} className="text-blue-500" /> Available Requests ({availableBroadcasts.length})
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableBroadcasts.map((b) => (
                               <div key={b._id} className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 hover:border-green-500 transition-all shadow-sm group">
                                  <div className="flex justify-between items-start mb-4">
                                     <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                        <MapPin size={20} />
                                     </div>
                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">₹40 Earning</span>
                                  </div>
                                  <p className="text-sm font-bold text-gray-800 line-clamp-2 mb-4">{b.order?.address?.fullAddress}</p>
                                  <button 
                                     onClick={() => acceptAssignment(b._id)} 
                                     className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 transition-all"
                                  >
                                     Take Order
                                  </button>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}

                   {/* Active Order Prompt */}
                   {activeAssignment && (
                      <div onClick={() => setActiveTab("active")} className="bg-orange-50 border-2 border-orange-100 p-6 rounded-[2rem] flex items-center justify-between cursor-pointer group hover:border-orange-300 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
                               <Navigation size={24} className="animate-pulse" />
                            </div>
                            <div>
                               <p className="font-black text-orange-800 text-lg">Active Order Ongoing</p>
                               <p className="text-sm text-orange-600 font-bold">You have an order in progress. View map tracking.</p>
                            </div>
                         </div>
                         <div className="bg-orange-500 text-white p-3 rounded-2xl group-hover:translate-x-1 transition-transform">
                            <Send size={20} />
                         </div>
                      </div>
                   )}

                   {availableBroadcasts.length === 0 && !activeAssignment && (
                      <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 text-center space-y-4">
                         <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto">
                            <ShoppingBag size={40} />
                         </div>
                         <div>
                            <h3 className="font-black text-gray-800 text-xl">Quiet right now</h3>
                            <p className="text-sm text-gray-500 font-bold max-w-xs mx-auto">We'll notify you as soon as a new delivery request is available in your area.</p>
                         </div>
                      </div>
                   )}
                </motion.div>
             ) : (
                <motion.div 
                    key="active" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 max-w-5xl mx-auto"
                >
                   {activeAssignment ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                         <div className="space-y-6 h-full flex flex-col">
                            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden h-80 relative flex-shrink-0">
                               <MapView 
                                  position={[activeAssignment.order.address.latitude || 28.6139, activeAssignment.order.address.longitude || 77.2090]} 
                               />
                               <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl border border-green-100 shadow-sm z-10">
                                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest flex items-center gap-2">
                                     <MapPin size={12} /> Delivery Destination
                                  </p>
                               </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 flex-1 overflow-y-auto">
                               <div className="flex justify-between items-start mb-6">
                                  <div>
                                     <h2 className="text-2xl font-black text-gray-900">Delivery Details</h2>
                                     <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-1">Order #{activeAssignment.order._id.slice(-6)}</p>
                                  </div>
                                  <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter">
                                     {activeAssignment.order.status}
                                  </div>
                               </div>

                               <div className="space-y-6">
                                  <div className="flex items-start gap-4">
                                     <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shrink-0">
                                        <MapPin size={24} />
                                     </div>
                                     <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Drop Location</p>
                                        <p className="font-bold text-gray-800 leading-relaxed">{activeAssignment.order.address.fullAddress}</p>
                                     </div>
                                  </div>

                                  <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Customer</p>
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 font-black shadow-sm">
                                              {activeAssignment.order.user?.name?.charAt(0) || "C"}
                                           </div>
                                           <div>
                                              <p className="font-black text-gray-800">{activeAssignment.order.user?.name}</p>
                                              <p className="text-sm font-bold text-gray-500">{activeAssignment.order.user?.mobile}</p>
                                           </div>
                                        </div>
                                        <button onClick={() => setChatOpen(true)} className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-2xl shadow-lg transition-all">
                                           <MessageSquare size={20} />
                                        </button>
                                     </div>
                                  </div>

                                  {!otpSent ? (
                                     <button 
                                        onClick={sendOtp} 
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
                                     >
                                        <PackageCheck size={24} /> REACHED LOCATION & SEND OTP
                                     </button>
                                  ) : (
                                     <div className="space-y-4 pt-2">
                                        <div className="relative">
                                           <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-green-500" size={24} />
                                           <input 
                                              type="text" 
                                              placeholder="ENTER 4-DIGIT OTP" 
                                              maxLength={4}
                                              value={otp}
                                              onChange={(e) => setOtp(e.target.value)}
                                              className="w-full bg-white border-2 border-green-200 rounded-[2rem] py-5 pl-14 pr-6 font-black text-2xl tracking-[1em] outline-none focus:border-green-500 transition-all text-center"
                                           />
                                        </div>
                                        <button 
                                           onClick={verifyOtp} 
                                           className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3"
                                        >
                                           <CheckCircle2 size={24} /> COMPLETE DELIVERY
                                        </button>
                                     </div>
                                  )}
                               </div>
                            </div>
                         </div>

                         <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 flex flex-col h-full overflow-hidden">
                            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                               <PackageCheck size={24} className="text-green-600" /> Order Manifest
                            </h2>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                               {activeAssignment.order.items.map((item: any, i: number) => (
                                  <div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                     <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center p-2">
                                        <img src={item.image} alt={item.name} className="object-contain" />
                                     </div>
                                     <div className="flex-1">
                                        <p className="font-black text-gray-800 text-sm">{item.name}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">{item.quantity} units @ ₹{item.price}</p>
                                     </div>
                                     <div className="text-right">
                                        <p className="font-black text-green-700">₹{item.quantity * item.price}</p>
                                     </div>
                                  </div>
                               ))}
                            </div>
                            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
                               <div>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                                  <p className="text-3xl font-black text-gray-900">₹{activeAssignment.order.totalAmount}</p>
                               </div>
                               <div className="bg-green-100 text-green-700 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-tighter">
                                  {activeAssignment.order.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'PAID ONLINE'}
                               </div>
                            </div>
                         </div>
                      </div>
                   ) : (
                      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
                         <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center text-green-200">
                            <Navigation size={64} className="animate-bounce" />
                         </div>
                         <div>
                            <h2 className="text-3xl font-black text-gray-800">Ready for Duty?</h2>
                            <p className="text-gray-500 font-bold mt-2">Waiting for new delivery requests in your area...</p>
                         </div>
                      </div>
                   )}
                </motion.div>
             )}
          </AnimatePresence>
       </div>

       <AnimatePresence>
        {chatOpen && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[60] bg-white flex flex-col sm:max-w-md sm:mx-auto sm:h-[80vh] sm:mt-[10vh] sm:rounded-3xl sm:shadow-2xl overflow-hidden"
          >
             <div className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Navigation size={18} />
                   </div>
                   <div>
                     <h3 className="font-bold">Chat with Customer</h3>
                     <p className="text-[10px] text-green-100 font-bold uppercase tracking-widest">AI Assisted</p>
                   </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="bg-green-700 hover:bg-green-800 p-2 rounded-full transition-colors">✕</button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === "Delivery" ? "justify-end" : "justify-start"}`}>
                     <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${m.sender === "Delivery" ? "bg-green-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"}`}>
                        <p className="text-sm">{m.text}</p>
                     </div>
                  </div>
                ))}
             </div>

             <div className="p-4 bg-white border-t border-gray-100">
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
                   />
                   <button onClick={sendMessage} className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-md transition-colors shrink-0">
                      <Send size={18} />
                   </button>
                </div>
             </div>
          </motion.div>
        )}
       </AnimatePresence>

       <AnimatePresence>
        {incomingBroadcast && (
           <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 left-6 right-6 z-50 md:left-auto md:right-8 md:w-96">
              <div className="bg-white rounded-[2rem] p-6 shadow-2xl border-2 border-green-500 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12"></div>
                 <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-4 rounded-2xl text-green-600 shadow-inner">
                       <Navigation size={28} className="animate-pulse" />
                    </div>
                    <div>
                       <h4 className="font-black text-gray-900 text-xl tracking-tighter">New Request Found!</h4>
                       <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest text-[10px]">Location: {incomingBroadcast.order?.address?.fullAddress?.slice(0, 30)}...</p>
                    </div>
                 </div>
                 <div className="mt-6 grid grid-cols-2 gap-3">
                    <button onClick={() => setIncomingBroadcast(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-2xl font-black text-sm transition-all uppercase tracking-widest">Ignore</button>
                    <button onClick={() => acceptAssignment(incomingBroadcast.assignmentId)} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-green-100 uppercase tracking-widest">Accept</button>
                 </div>
              </div>
           </motion.div>
        )}
       </AnimatePresence>
    </div>
  );
}
