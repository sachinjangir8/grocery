"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutDashboard, ShoppingBag, Store, Users, IndianRupee, Clock, Trash2, Plus, X, Shield, Upload, Navigation, MapPin as MapPinIcon, LogOut } from "lucide-react";
import axios from "axios";
import dynamic from "next/dynamic";
import { getSocket } from "@/lib/socket";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function AdminDashBord() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [groceries, setGroceries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const socket = getSocket();
  
  // Filter state
  const [orderSearch, setOrderSearch] = useState("");
  const [grocerySearch, setGrocerySearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  
  // Modals & Dashboard state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<[number, number] | null>(null);
  const [showAddGrocery, setShowAddGrocery] = useState(false);
  const [editingGrocery, setEditingGrocery] = useState<any>(null);
  const [groceryForm, setGroceryForm] = useState({ name: "", category: "Dairy & Eggs", price: "", unit: "", image: null as any });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedOrder?._id && (selectedOrder.status === 'outForDelivery' || selectedOrder.status === 'arrived')) {
        socket.emit("joinRoom", `order_${selectedOrder._id}`);
        setDeliveryLocation(null); // Reset
        
        socket.on("locationUpdate", (data: any) => {
            setDeliveryLocation([data.latitude, data.longitude]);
        });
    }
    return () => {
        socket.off("locationUpdate");
    };
  }, [selectedOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, groceriesRes, usersRes] = await Promise.all([
        axios.get("/api/admin/dashboard-stats"),
        axios.get("/api/admin/get-orders"),
        axios.get("/api/grocery"),
        axios.get("/api/admin/get-users")
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data.orders || []);
      setGroceries(groceriesRes.data.groceries || groceriesRes.data || []);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      console.error("Error fetching admin data", error);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.post(`/api/admin/update-order-status/${orderId}`, { status });
      alert(`Order status updated to ${status}`);
      fetchData();
    } catch (error) {
      console.error("Error updating status", error);
      alert("Failed to update status");
    }
  };

  const deleteGrocery = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`/api/admin/delete-grocery/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting grocery", error);
    }
  };

  const updateRole = async (userId: string, role: string) => {
    try {
      await axios.post("/api/admin/update-role", { userId, role });
      fetchData();
    } catch (error) {
      console.error("Error updating role", error);
    }
  };

  const handleAddGrocery = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", groceryForm.name);
    formData.append("category", groceryForm.category);
    formData.append("price", groceryForm.price);
    formData.append("unit", groceryForm.unit);
    if (groceryForm.image) formData.append("image", groceryForm.image);

    try {
      if (editingGrocery) {
          await axios.post(`/api/admin/update-grocery/${editingGrocery._id}`, formData);
          setEditingGrocery(null);
      } else {
          await axios.post("/api/admin/add-grocery", formData);
          setShowAddGrocery(false);
      }
      setGroceryForm({ name: "", category: "Dairy & Eggs", price: "", unit: "", image: null });
      fetchData();
    } catch (error) {
      console.error("Error saving grocery", error);
    }
  };

  const startEditGrocery = (item: any) => {
    setEditingGrocery(item);
    setGroceryForm({
        name: item.name,
        category: item.category,
        price: item.price.toString(),
        unit: item.unit,
        image: null
    });
  };

  const seedDatabase = async () => {
    setSeeding(true);
    try {
        await axios.post("/api/admin/seed");
        alert("Database seeded successfully!");
        fetchData();
    } catch (err: any) {
        const errorMsg = err.response?.data?.error || err.message;
        alert("Seed failed: " + errorMsg);
        console.error("Seed error details:", err.response?.data);
    } finally {
        setSeeding(false);
    }
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "groceries", label: "Groceries", icon: Store },
    { id: "users", label: "Users", icon: Users },
  ];

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-md z-20">
        <div className="p-6">
          <h2 className="text-2xl font-black text-green-700 tracking-tighter">ADMIN CORE</h2>
        </div>
        <nav className="mt-6 flex flex-col gap-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                  activeTab === item.id ? "bg-green-600 text-white shadow-lg" : "text-gray-500 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-100 p-6 sticky top-0 z-30 shadow-sm flex justify-between items-center">
          <h1 className="text-xl font-black text-gray-800 tracking-tighter uppercase">Administrative Hub</h1>
          <div className="flex items-center gap-3">
             <button 
                onClick={fetchData} 
                className="p-3 rounded-2xl text-gray-500 hover:bg-gray-100 transition-all border border-gray-100 shadow-sm"
                title="Refresh Data"
             >
                <Clock size={20} />
             </button>
             <button 
                onClick={() => {
                   localStorage.removeItem("token");
                   import("next-auth/react").then(m => m.signOut({ callbackUrl: "/login" }));
                }}
                className="p-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all border border-gray-100 shadow-sm"
                title="Logout"
             >
                <LogOut size={20} />
             </button>
          </div>
        </div>

        <div className="p-8">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Overview Tab */}
          {activeTab === "overview" && stats && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-gray-900">Platform Analytics</h1>
                <button onClick={seedDatabase} disabled={seeding} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100">
                  {seeding ? "Populating..." : "✨ Seed Demo Data"}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={IndianRupee} title="Today's Earnings" value={`₹${stats.todayEarnings}`} color="text-green-600" bg="bg-green-100" />
                <StatCard icon={IndianRupee} title="Total Revenue" value={`₹${stats.totalEarnings}`} color="text-blue-600" bg="bg-blue-100" />
                <StatCard icon={ShoppingBag} title="Total Orders" value={stats.totalOrders} color="text-purple-600" bg="bg-purple-100" />
                <StatCard icon={Clock} title="Active Requests" value={stats.pendingOrders} color="text-orange-600" bg="bg-orange-100" />
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                <h3 className="text-lg font-black text-gray-800 mb-8">Revenue Growth (7 Days)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-15} />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="earnings" stroke="#16a34a" strokeWidth={5} dot={{r: 6, fill: '#16a34a', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 10}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-black text-gray-900">Manage Orders</h1>
              <div className="flex gap-4 mb-2">
                 <input 
                   type="text" 
                   placeholder="Search by ID or Customer..." 
                   className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm w-64 outline-none focus:border-green-500"
                   value={orderSearch}
                   onChange={(e) => setOrderSearch(e.target.value)}
                 />
                 <select 
                   className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-green-500 font-bold"
                   value={orderStatusFilter}
                   onChange={(e) => setOrderStatusFilter(e.target.value)}
                 >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="outForDelivery">Out for Delivery</option>
                    <option value="arrived">Arrived</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                 </select>
              </div>
              <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-5 font-black text-gray-400 text-xs uppercase tracking-widest">ID</th>
                      <th className="px-6 py-5 font-black text-gray-400 text-xs uppercase tracking-widest">Customer</th>
                      <th className="px-6 py-5 font-black text-gray-400 text-xs uppercase tracking-widest">Total</th>
                      <th className="px-6 py-5 font-black text-gray-400 text-xs uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 font-black text-gray-400 text-xs uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders
                      .filter(o => {
                        const matchesSearch = o._id.includes(orderSearch) || o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase());
                        const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-5 text-sm font-bold text-gray-900">#{order._id.slice(-6)}</td>
                        <td className="px-6 py-5 text-sm text-gray-600 font-medium">{order.user?.name || "Deleted User"}</td>
                        <td className="px-6 py-5 text-sm font-black text-gray-900">₹{order.totalAmount}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'outForDelivery' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 flex items-center gap-4">
                          <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)} className="bg-white border-2 border-gray-100 text-gray-800 text-xs font-bold rounded-xl p-2 outline-none focus:border-green-500">
                            <option value="pending">Pending</option>
                            <option value="outForDelivery">Out for Delivery</option>
                            <option value="arrived">Arrived</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button onClick={() => setSelectedOrder(order)} className="text-green-600 font-black text-xs hover:underline uppercase tracking-tighter">Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Groceries Tab */}
          {activeTab === "groceries" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-gray-900">Inventory Management</h1>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm w-48 outline-none focus:border-green-500"
                    value={grocerySearch}
                    onChange={(e) => setGrocerySearch(e.target.value)}
                  />
                  <button onClick={() => setShowAddGrocery(true)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-green-100">
                    <Plus size={20} /> Add New Item
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {groceries
                  .filter(g => g.name.toLowerCase().includes(grocerySearch.toLowerCase()) || g.category.toLowerCase().includes(grocerySearch.toLowerCase()))
                  .map((item) => (
                  <div key={item._id} className="bg-white p-5 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative group overflow-hidden">
                    <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditGrocery(item)} className="bg-white/90 backdrop-blur-sm text-blue-600 p-2 rounded-full hover:bg-blue-500 hover:text-white shadow-sm">
                        <Plus className="rotate-45" size={16} /> 
                      </button>
                      <button onClick={() => deleteGrocery(item._id)} className="bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="aspect-square bg-gray-50 rounded-2xl mb-5 relative overflow-hidden flex items-center justify-center p-4">
                       <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="px-2">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">{item.category}</p>
                        <h3 className="font-black text-gray-800 truncate">{item.name}</h3>
                        <div className="mt-4 flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                          <span className="font-black text-gray-900 text-lg">₹{item.price}</span>
                          <span className="text-[10px] font-black text-gray-400 uppercase">Per {item.unit}</span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-black text-gray-900">System Users</h1>
              <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-5 font-black text-gray-400 text-xs uppercase tracking-widest">Name</th>
                      <th className="px-6 py-5 font-black text-gray-400 text-xs uppercase tracking-widest">Email</th>
                      <th className="px-6 py-5 font-black text-gray-400 text-xs uppercase tracking-widest">Role</th>
                      <th className="px-6 py-5 font-black text-gray-400 text-xs uppercase tracking-widest">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5 flex items-center gap-3">
                           <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">
                              {user.name.charAt(0)}
                           </div>
                           <span className="text-sm font-bold text-gray-900">{user.name}</span>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-5">
                          <select value={user.role} onChange={(e) => updateRole(user._id, e.target.value)} className="bg-gray-100 text-gray-800 text-[10px] font-black uppercase rounded-lg p-2 outline-none border-none">
                            <option value="user">Customer</option>
                            <option value="deliveryBoy">Partner</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                        <td className="px-6 py-5 text-xs text-gray-400 font-medium">{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
                 <div>
                   <h2 className="text-2xl font-black text-green-800">Order Manifest</h2>
                   <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-1">Ref ID: {selectedOrder._id}</p>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"><X size={24} /></button>
              </div>
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-2 gap-12">
                    <div>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Customer Details</h3>
                      <p className="font-black text-gray-800 text-lg">{selectedOrder.user?.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedOrder.user?.email}</p>
                      <p className="text-sm font-bold text-gray-800 mt-2 flex items-center gap-2">📞 {selectedOrder.user?.mobile}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Shipping Point</h3>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">{selectedOrder.address.fullAddress}</p>
                    </div>
                 </div>
                 <div>
                   <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Itemized List</h3>
                   <div className="space-y-4">
                      {selectedOrder.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-5 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                           <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden relative border border-gray-200 flex items-center justify-center p-2">
                             <img src={item.image} alt={item.name} className="object-contain" />
                           </div>
                           <div className="flex-1">
                              <p className="font-black text-gray-800">{item.name}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase">{item.quantity} units @ ₹{item.price}</p>
                           </div>
                           <p className="font-black text-green-700 text-lg">₹{item.quantity * item.price}</p>
                        </div>
                      ))}
                   </div>
                 </div>

                 {/* Live Tracking Map for Admin */}
                 {(selectedOrder.status === 'outForDelivery' || selectedOrder.status === 'arrived') && (
                   <div className="pt-4">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                        <Navigation size={12} className="text-green-600 animate-pulse" /> Live Tracking
                      </h3>
                      <div className="h-64 rounded-[2rem] overflow-hidden border-2 border-green-100 relative shadow-inner z-0">
                         <MapView 
                            customerPosition={[selectedOrder.address.latitude || 28.6139, selectedOrder.address.longitude || 77.2090]}
                            partnerPosition={deliveryLocation}
                         />
                         {!deliveryLocation && (
                           <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none z-10">
                              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200 text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                                 <Clock size={12} className="animate-spin" /> Waiting for partner signal...
                              </div>
                           </div>
                         )}
                      </div>
                   </div>
                 )}
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Payable</p>
                      <p className="text-3xl font-black text-gray-900">₹{selectedOrder.totalAmount}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="bg-gray-900 text-white px-10 py-4 rounded-[1.5rem] font-black hover:bg-black transition-all shadow-xl shadow-gray-200">Dismiss</button>
              </div>
            </motion.div>
          </div>
        )}

        {showAddGrocery || editingGrocery ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl">
               <div className={`p-8 border-b border-gray-100 flex justify-between items-center ${editingGrocery ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
                  <h2 className="text-2xl font-black">{editingGrocery ? 'Update Item' : 'Add New Inventory'}</h2>
                  <button onClick={() => { setShowAddGrocery(false); setEditingGrocery(null); }} className="p-2 hover:bg-black/10 rounded-full transition-colors"><X size={24} /></button>
               </div>
               <form onSubmit={handleAddGrocery} className="p-8 space-y-6">
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Name</label>
                           <input required type="text" value={groceryForm.name} onChange={e => setGroceryForm({...groceryForm, name: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 font-bold outline-none focus:border-green-500 focus:bg-white transition-all" placeholder="e.g. Fresh Milk" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                           <select value={groceryForm.category} onChange={e => setGroceryForm({...groceryForm, category: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 font-bold outline-none focus:border-green-500 focus:bg-white transition-all">
                              <option>Dairy & Eggs</option>
                              <option>Rice, Atta & Grains</option>
                              <option>Snacks & Biscuits</option>
                              <option>Beverages & Drinks</option>
                              <option>Personal Care</option>
                              <option>Household Essentials</option>
                           </select>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price (₹)</label>
                           <input required type="number" value={groceryForm.price} onChange={e => setGroceryForm({...groceryForm, price: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 font-bold outline-none focus:border-green-500 focus:bg-white transition-all" placeholder="100" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit</label>
                           <input required type="text" value={groceryForm.unit} onChange={e => setGroceryForm({...groceryForm, unit: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 font-bold outline-none focus:border-green-500 focus:bg-white transition-all" placeholder="kg / packet" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Image {editingGrocery && "(Optional)"}</label>
                        <div className="relative group cursor-pointer">
                           <input type="file" onChange={e => setGroceryForm({...groceryForm, image: e.target.files?.[0]})} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                           <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group-hover:border-green-500 group-hover:bg-green-50 transition-all">
                              <Upload size={32} className="text-gray-400 group-hover:text-green-600" />
                              <p className="text-sm font-bold text-gray-500 group-hover:text-green-700">{groceryForm.image ? groceryForm.image.name : (editingGrocery ? "Leave blank to keep current" : "Click to upload image")}</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="pt-4">
                     <button type="submit" className={`w-full ${editingGrocery ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white py-5 rounded-2xl font-black text-xl shadow-xl transition-all`}>
                        {editingGrocery ? 'Update Changes' : 'Publish Item'}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-5">
      <div className={`p-5 rounded-3xl ${bg} ${color}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
      </div>
    </div>
  );
}
