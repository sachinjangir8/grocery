"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, CreditCard, User, Phone, Landmark, Search, Target, CheckCircle2, LocateFixed, Loader2,  } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import "leaflet/dist/leaflet.css";

// import { MapContainer, TileLayer } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMap } from 'react-leaflet';
import axios from 'axios';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { useRouter } from "next/navigation";


const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);

const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);

const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);
const markerIcon =
    typeof window !== "undefined"
        ? new L.Icon({
            iconUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        })
        : null;





// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function CheckoutPage() {
    const router = useRouter(); 
    const { userData } = useSelector((state: RootState) => state.user)
    const { subtotal, deliveryfee, finaltotal, cartData } = useSelector((state: RootState) => state.cart)
    const [address, setAddress] = useState({
        fullname: "",
        mobile: "",
        city: "",
        state: "",
        pincode: "",
        fulladdress: ""
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    // console.log(address.fullname,"userData hh ye");
    const [position, setPosition] = useState<[number, number] | null>(null);
    useEffect(() => {
        // Get the user's position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setPosition([position.coords.latitude, position.coords.longitude]);
                // console.log(position.coords.latitude, position.coords.longitude);
            }, (error) => {
                console.error("Error getting user position:", error);
            }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        }
    }, []);
    useEffect(() => {
        if (userData) {
            setAddress((prev) => ({
                ...prev,
                fullname: userData?.name || "",
                mobile: userData?.mobile || "",
            }));
        }
    }, [userData]);

    const DragableMarker: React.FC = () => {
        const map = useMap();

        useEffect(() => {
            if (!position) return;
            map.setView(position, 15, { animate: true, duration: 0.5 });
        }, [position, map]);

        if (!position || !markerIcon) return null;

        return (
            <Marker
                position={position}
                icon={markerIcon}
                draggable
                eventHandlers={{
                    dragend: (e) => {
                        const marker = e.target as L.Marker;
                        const { lat, lng } = marker.getLatLng();
                        setPosition([lat, lng]);
                    },
                }}
            />
        );
    };
    const handleSearchQuery = async () => {
        setSearchLoading(true);
        const provider = new OpenStreetMapProvider();
        const result = await provider.search({ query: searchQuery })
        // console.log(result);
        if (result) {
            setPosition([result[0].y, result[0].x]);
        }
        setSearchLoading(false);
    };
    useEffect(() => {
        const fetchAddress = async () => {
            if (!position) return;
            try {
                const result = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`)
                // console.log("city place aaya kya-", result.data);
                setAddress((prev) => ({
                    ...prev, city: result.data.address.city || "",
                    state: result.data.address.state || "",
                    pincode: result.data.address.postcode || "",
                    fulladdress: result.data.display_name || ""
                }))
            } catch (error) {
                console.error("Error fetching address:", error);

            }
        }
        fetchAddress();
    }, [position])

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setPosition([position.coords.latitude, position.coords.longitude]);
            }, (error) => {
                console.error("Error getting user position:", error);
            }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        }
    };

    const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('cod');
    const [isHovered, setIsHovered] = useState(false);

    const handlecod = async () => {
        if (!userData?._id) {
            alert("User not logged in");
            return;
        }

        if (!position) {
            alert("Location not selected");
            return;
        }

        if (cartData.length === 0) {
            alert("Cart is empty");
            return;
        }

        try {
            const res = await axios.post("/api/user/order", {
                userId: userData._id,
                items: cartData.map(item => ({
                    grocery: item._id,
                    name: item.name,
                    price: item.price,
                    unit: item.unit,
                    quantity: item.quantity,
                    image: item.image,
                })),
                totalAmount: finaltotal,
                address: {
                    fullName: address.fullname,       // ✅ FIX
                    mobile: address.mobile,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    fullAddress: address.fulladdress, // ✅ FIX
                    latitude: position[0],
                    longitude: position[1],
                },
                paymentMethod: "cod",
            });


            // console.log("ORDER SUCCESS:", res.data);
            router.push(`/user/order-success`);
        } catch (err) {
            console.error("ORDER ERROR:", err);
        }
    };
    const handleonline = async () => {
        if (!userData?._id) {
            alert("User not logged in");
            return;
        }
        if (!position) {
            alert("Location not selected");
            return;
        }
        try {
            const result=await axios.post('/api/user/payment',{
                userId: userData._id,
                items: cartData.map(item => ({
                    grocery: item._id,
                    name: item.name,
                    price: item.price,
                    unit: item.unit,
                    quantity: item.quantity,
                    image: item.image,
                })),
                totalAmount: finaltotal,
                address: {
                    fullName: address.fullname,       // ✅ FIX
                    mobile: address.mobile,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    fullAddress: address.fulladdress, // ✅ FIX
                    latitude: position[0],
                    longitude: position[1],
                },
                paymentMethod: "online",
            })
            // result will provide a url 
            window.location.href = result.data.url;
        } catch (error) {
            console.error("PAYMENT ERROR:", error);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-[#f8fafc] p-4 md:p-8 overflow-x-hidden"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="max-w-6xl mx-auto mb-8">
                <Link href="/user/cart" className="group flex items-center text-green-700 font-medium mb-4 w-fit">
                    <motion.div whileHover={{ x: -4 }}>
                        <ArrowLeft size={18} className="mr-2" />
                    </motion.div>
                    Back to Cart
                </Link>
                <h1 className="text-4xl font-black text-green-800 text-center tracking-tight">Checkout</h1>
            </motion.div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Left Side: Delivery Address */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                        <div className="flex items-center gap-3 mb-8 text-green-700">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <MapPin size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Delivery Address</h2>
                        </div>

                        <div className="space-y-5">
                            <motion.div
                                whileFocus={{ scale: 1.01 }}
                                className="relative group"
                            >
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    // placeholder={"address.fullname"}
                                    value={address.fullname}
                                    onChange={(e) => setAddress((prev) => ({ ...prev, fullname: e.target.value }))}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium"
                                />
                            </motion.div>
                            <motion.div
                                whileFocus={{ scale: 1.01 }}
                                className="relative group"
                            >
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={address.mobile}
                                    onChange={(e) => setAddress((prev) => ({ ...prev, mobile: e.target.value }))}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium"
                                />
                            </motion.div><motion.div
                                whileFocus={{ scale: 1.01 }}
                                className="relative group"
                            >
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={address.fulladdress}
                                    onChange={(e) => setAddress((prev) => ({ ...prev, fulladdress: e.target.value }))}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium"
                                />
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* City Input */}
                                <div className="relative group">
                                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        // placeholder="Jhansi"
                                        value={address.city}
                                        onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-green-500 outline-none transition-all text-sm"
                                    />
                                </div>

                                {/* State Input */}
                                <div className="relative group">
                                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        // placeholder="Uttar Pradesh"
                                        value={address.state}
                                        onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-green-500 outline-none transition-all text-sm"
                                    />
                                </div>

                                {/* Pincode Input */}
                                <div className="relative group">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        // placeholder="284003"
                                        value={address.pincode}
                                        onChange={(e) => setAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-green-500 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <input type="text" placeholder="Search city or area..." className="flex-1 p-4 rounded-2xl border-2
                                 border-gray-50 bg-gray-50/50 focus:border-green-500 focus:bg-white outline-none transition-all
                                  font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                <motion.button
                                    whileHover={{ scale: 1.05, rotate: 360 }}
                                    whileTap={{ scale: 0.95, z: 1 }}
                                    className="bg-green-600 text-white px-6 rounded-2xl font-bold shadow-lg shadow-green-200 flex items-center gap-2"
                                    onClick={handleSearchQuery}
                                >
                                    <Search size={18} /> <span className="hidden md:inline">{searchLoading ? <Loader2 className="animate-spin" /> : 'Search'}</span>
                                </motion.button>
                            </div>

                            {/* Map Placeholder */}
                            {/* <MapView position={position as [number, number] | null} /> */}
                            {position && (
                                <div className="relative w-full h-[300px] rounded-2xl overflow-hidden mt-4">
                                    <MapContainer
                                        center={position}
                                        zoom={13}
                                        scrollWheelZoom
                                        className="h-full w-full"
                                    >
                                        <TileLayer
                                            attribution="&copy; OpenStreetMap contributors"
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <DragableMarker />
                                    </MapContainer>

                                    <motion.button
                                        whileTap={{ scale: 0.9, rotate: 360 }}
                                        whileHover={{ scale: 1.05, rotate: 360 }}
                                        className="absolute bottom-4 right-4 bg-green-600 text-white shadow-lg rounded-full p-3 hover:bg-green-700 transition-all flex items-center justify-center z-[500]"
                                        onClick={handleCurrentLocation}
                                    >
                                        <LocateFixed size={22} />
                                    </motion.button>


                                </div>

                            )}


                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Payment & Order Summary */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                        <div className="flex items-center gap-3 mb-8 text-green-700">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CreditCard size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Payment Method</h2>
                        </div>

                        <div className="grid gap-4">
                            <motion.div
                                onClick={() => setPaymentMethod("online")}
                                whileHover={{ x: 5 }}
                                className={`relative p-6 rounded-2xl flex items-center gap-4 cursor-pointer border-2 transition-all overflow-hidden ${paymentMethod === "online"
                                    ? 'border-green-500 bg-green-50/30'
                                    : 'border-gray-100 bg-gray-50/30 hover:bg-white'
                                    }`}
                            >
                                {paymentMethod === "online" && (
                                    <motion.div
                                        layoutId="activePayment"
                                        className="absolute inset-0 bg-green-500/5 z-0"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <div className={`p-3 rounded-xl transition-colors ${paymentMethod === "online" ? 'bg-green-600 text-white' : 'bg-white text-gray-400'}`}>
                                    <CreditCard size={24} />
                                </div>
                                <span className={`font-bold text-lg flex-1 ${paymentMethod === "online" ? 'text-green-800' : 'text-gray-500'}`}>
                                    {'Pay Online (Stripe)'}
                                </span>
                                {paymentMethod === "online" && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                        <CheckCircle2 className="text-green-600" />
                                    </motion.div>
                                )}
                            </motion.div>
                            <motion.div
                                onClick={() => setPaymentMethod("cod")}
                                whileHover={{ x: 5 }}
                                className={`relative p-6 rounded-2xl flex items-center gap-4 cursor-pointer border-2 transition-all overflow-hidden ${paymentMethod === "cod"
                                    ? 'border-green-500 bg-green-50/30'
                                    : 'border-gray-100 bg-gray-50/30 hover:bg-white'
                                    }`}
                            >
                                {paymentMethod === "cod" && (
                                    <motion.div
                                        layoutId="activePayment"
                                        className="absolute inset-0 bg-green-500/5 z-0"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <div className={`p-3 rounded-xl transition-colors ${paymentMethod === "cod" ? 'bg-green-600 text-white' : 'bg-white text-gray-400'}`}>
                                    <CreditCard size={24} />
                                </div>
                                <span className={`font-bold text-lg flex-1 ${paymentMethod === "cod" ? 'text-green-800' : 'text-gray-500'}`}>
                                    {'Pay Cash On Delivery'}
                                </span>
                                {paymentMethod === "cod" && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                        <CheckCircle2 className="text-green-600" />
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>

                        {/* Price Summary Panel */}
                        <div className="mt-10 space-y-4 pt-8 border-t-2 border-dashed border-gray-100">
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Subtotal</span>
                                <span className="text-gray-800">₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Delivery Fee</span>
                                <span className="text-green-600 font-bold">₹{deliveryfee}</span>
                            </div>

                            <motion.div
                                className="flex justify-between items-center py-4 px-6 bg-gray-900 rounded-2xl"
                                whileHover={{ scale: 1.02 }}
                            >
                                <span className="text-white font-medium">Total Amount</span>
                                <span className="text-2xl font-black text-green-400">₹{finaltotal}</span>
                            </motion.div>

                            <motion.button
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                whileHover={{ scale: 1.03, y: -4 }}
                                whileTap={{ scale: 0.97 }}
                                className="relative w-full overflow-hidden bg-green-600 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-green-200 text-xl group"
                                onClick={() => {
                                    if (paymentMethod == "cod") {
                                        handlecod()
                                    } else {
                                        handleonline()
                                    }
                                }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-white/20"
                                    animate={{ x: isHovered ? ['-100%', '100%'] : '-100%' }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}

                                />
                                Place Order Now
                            </motion.button>
                    
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}