"use client";

import React, { useState, useRef, FormEvent } from 'react';
import { ArrowLeft, PlusCircle, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import axios from 'axios';
// Removed: import { image } from 'motion/react-client'; <--- This was an invalid import
import { toast } from 'react-toastify';

const categories = [
  "Dairy & Eggs", "Rice, Atta & Grains", "Snacks & Biscuits",
  "Spices & Masalas", "Beverages & Drinks", "Personal Care",
  "Household Essentials", "Instant & Packaged Food", "Baby & Pet Care"
];

const units = ["kg", "gram", "liter", "ml", "piece", "pack"];

const AddGrocery = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    price: '',
    image: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setFormData((prev) => ({ ...prev, image: file }));
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("category", formData.category);
      dataToSend.append("unit", formData.unit);
      dataToSend.append("price", formData.price);
      
      if (formData.image) {
        dataToSend.append("image", formData.image);
      }

      const result = await axios.post("/api/admin/add-grocery", dataToSend);

      if (result.status === 200 || result.status === 201) {
        // ✅ SUCCESS: Using valid 'colored' theme
        toast.success("Grocery added successfully!", { theme: "colored" });

        setFormData({
          name: '',
          category: '',
          unit: '',
          price: '',
          image: null,
        });
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
      }
    } catch (error: any) {
      console.error("Upload Error:", error.response?.data || error.message);
      
      // ✅ FIX: Changed theme from "emerald" to "colored" or "light"
      toast.error(error.response?.data?.message || "Something went wrong!", { 
        theme: "colored" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-4 md:p-8 flex flex-col items-start font-sans">
      <button 
        onClick={() => router.back()}
        className="hidden md:flex items-center text-gray-600 bg-white px-5 py-2.5 rounded-full shadow-sm hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md transition-all mb-8 text-sm font-medium cursor-pointer border border-transparent hover:border-emerald-100"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </button>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-emerald-900/5 p-8 md:p-12 border border-emerald-50"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-emerald-100 p-3 rounded-full mb-4">
            <PlusCircle className="w-8 h-8 text-[#10b981]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Add Your Grocery</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grocery Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Grocery Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="eg: Fresh Milk..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
              <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">
                <option value="">Select Category</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit *</label>
              <select name="unit" required value={formData.unit} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none">
                <option value="">Select Unit</option>
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹) *</label>
            <input type="number" name="price" required value={formData.price} onChange={handleChange} placeholder="0.00" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
          </div>

          <div className="space-y-3">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100">
              <Upload className="w-4 h-4 mr-2" />
              {formData.image ? 'Change image' : 'Upload image'}
            </button>

            <AnimatePresence>
              {preview && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative inline-block mt-2 rounded-xl overflow-hidden border-2 border-emerald-100">
                  <Image src={preview} width={120} height={120} alt="Preview" className="object-cover w-32 h-32" />
                  <button onClick={() => {setPreview(null); setFormData(p => ({...p, image: null}))}} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{scale:0.98}}
            disabled={loading}
            type="submit"
            className={`w-full ${loading ? 'bg-gray-400' : 'bg-[#10b981] hover:bg-[#059669]'} text-white font-bold py-4 rounded-xl shadow-lg transition-all`}
          >
            {loading ? "Adding..." : "Add Grocery"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddGrocery;