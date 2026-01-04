"use client";
import Image from "next/image";
import {
  Boxes,
  Clipboard,
  Cross,
  Eye,
  LogOut,
  MenuIcon,
  Package,
  Plus,
  PlusCircle,
  Search,
  ShoppingBagIcon,
  User,
  X,
} from "lucide-react";
import mongoose from "mongoose";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { signOut } from "next-auth/react";
import { createPortal } from "react-dom";
import { a, h1 } from "motion/react-client";

interface IUser {
  _id?: mongoose.Schema.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "admin" | "deliveryBoy";
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

function Nav({ user }: { user: IUser }) {
  const [open, setOpen] = useState(false);
  const [searchbaropen, setSearchbaropen] = React.useState(false);
  const [menuopen, setMenuopen] = React.useState(false);
  const profiledropdown = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        profiledropdown.current &&
        !profiledropdown.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
const Sidebar=menuopen?createPortal(
  <AnimatePresence>
    <motion.div
    initial={{ opacity: 0, scale: 0.8, y: -20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    exit={{ opacity: 0, scale: 0.8, y: -20 }}
    className="fixed top-24 left-0 bg-white rounded-lg
     py-2 w-[90%] max-w-xs shadow-lg z-40 items-center px-4  "
    >
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-green-600 font-semibold text-lg">Admin Panel</h1>
      </div>
      <div className="flex items-center gap-3 p-3 mt-3 bg-green-100 rounded-lg">
        <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">{ user.image? <Image src={user.image} alt="user" width={40} height={40} 
        className="object-cover rounded-full" /> : <User className="w-8 h-8 text-green-600" /> }</div>
        <div>
          <h2 className="text-green-600 font-semibold text-lg">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.role}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 font-semibold mt-5">
      <Link  href={"/admin/add-grocery"} className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-all bg-green-100 rounded-lg p-2" >
              <PlusCircle className="w-5 h-5 text-green-600 mr-2" /> Add Grocery
            </Link>
            <Link  href={"/admin/orders"} className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-all bg-green-100 rounded-lg p-2" >
              <Boxes className="w-5 h-5 text-green-600 mr-2" /> View Grocery
            </Link>
            <Link  href={"/admin/users"} className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-all bg-green-100 rounded-lg p-2  " >
            <Clipboard className="w-5 h-5 text-green-600 mr-2" /> Manage Grocery
            </Link>
      </div>
      <div className="my-5 border-t border-gray-200"></div>
      <div className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-all bg-green-100 rounded-lg p-2 cursor-pointer" onClick={() => {
        setMenuopen(false);
        localStorage.removeItem("token");
        signOut({ callbackUrl: "/login" });
      }}>
        <LogOut className="w-5 h-5 text-green-600 mr-2" /> Logout
      </div>
    </motion.div>
  </AnimatePresence>,
  document.body
  ):null;
  return (
    <div
      className="w-[95%] fixed top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-green-500
    to-green-700 rounded-2xl shadow-lg shadow-black/30 flex justify-between items-center h-16 px-4 md:px-8 z-50"
    >
      {/* left */}
      <Link
        href={"/"}
        className="text-white font-extrabold text-2xl sm:text-3xl tracking-wide hover:scale-105 transition-transform"
      >
        Grocery
      </Link>

      {/* mid */}
      {user.role==="user" &&(
        <form
        className="hidden md:flex items-center bg-white rounded-full px-4 py-2 w-1/2 max-w-xs shadow-md
         shadow-black/20 hover:shadow-lg hover:shadow-black/30 transition-shadow"
      >
        <Search className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search for products..."
          className="w-full outline-none"
        />
      </form>
      ) }
      

      {/* right */}
      <div className="flex items-center gap-4 md:gap-6 cursor-pointer relative">
        {user.role==="user" &&(
<>
         <div
          className="relative bg-amber-50 rounded-full w-11 h-11 flex items-center
          justify-center shadow-md hover:scale-105 transition-transform md:hidden "
          onClick={() => 
            setSearchbaropen((prev) => !prev)
          }
          >
          <Search className="text-green-600 w-6 h-6" />
        </div>
        <Link
          href={"/cart"}
          className="relative bg-amber-50 rounded-full w-11 h-11 flex items-center justify-center
           shadow-md hover:scale-105 transition-transform"
        >
          <ShoppingBagIcon className="text-green-600 w-6 h-6" />
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5
            rounded-full flex items-center justify-center font-semibold"
          >
            3
          </span>
        </Link>
          </>
        )}
        {
          user.role==="admin" &&<>
          <div className="hidden md:flex items-center gap-4">
            <Link  href={"/admin/add-grocery"} className="flex text-white bg-green-600 px-4 py-2 rounded-full hover:bg-green-700 transition-all" >
              <PlusCircle className="w-5 h-5 text-white mr-2" /> Add Grocery
            </Link>
            <Link  href={"/admin/orders"} className="flex text-white bg-green-600 px-4 py-2 rounded-full hover:bg-green-700 transition-all" >
              <Boxes className="w-5 h-5 text-white mr-2" /> View Grocery
            </Link>
            <Link  href={"/admin/users"} className="flex text-white bg-green-600 px-4 py-2 rounded-full hover:bg-green-700 transition-all" >
            <Clipboard className="w-5 h-5 text-white mr-2" /> Manage Grocery
            </Link>
          </div>
          <div className="md:hidden" onClick={() => setMenuopen(prev=>!prev)}>
            <MenuIcon className="w-5 h-5 text-white mr-2" />
          </div>
          </>
        }
        
        
        <div className="relative" ref={profiledropdown}>
          <div
            className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center"
            onClick={() => {
              setOpen((prev) => !prev);
            }}
          >
            {user.image ? (
              <Image
                src={user.image}
                alt="user"
                width={40}
                height={40}
                className="object-cover rounded-full"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="absolute top-12 right-0 bg-white rounded-lg shadow-lg w-48 py-2 flex flex-col z-50"
              >
                <div className="flex items-center gap-3 border-b py-2 px-3 border-gray-200">
                  <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt="user"
                        width={40}
                        height={40}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>

                  {/* Name + Role stacked */}
                  <div className="flex flex-col leading-tight">
                    <span className="text-gray-800 font-semibold">
                      {user.name}
                    </span>
                    <span className="text-sm text-gray-500">{user.role}</span>
                  </div>
                </div>
                    {
                      user.role==="user" &&<> 
                      <Link href="/profile" onClick={() => setOpen(false)}>
                  <button className="flex w-full text-left py-2 px-3 hover:bg-green-300 rounded-b-lg text-green-800 ">
                    <Package className="w-5 h-5 text-green-800"></Package> my
                    orders
                  </button>
                </Link>
                      </>
                    }
                
                <button
                  className="flex w-full text-left py-2 px-3 hover:bg-red-300 rounded-b-lg text-red-800"
                  onClick={() => {
                    // logout logic
                    setOpen(false);
                    localStorage.removeItem("token");
                    signOut({ callbackUrl: "/login" });
                  }}
                >
                  <LogOut className="w-5 h-5 text-red-800"></LogOut> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {searchbaropen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 bg-white rounded-full
                 py-2 w-[90%] max-w-md shadow-lg z-40 flex items-center px-4  "
              >
                <Search className="text-gray-400 mr-2" />
                <form className="grow">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full outline-none text-gray-700"
                  />
                </form>
                <button
                  onClick={() => {
                    setSearchbaropen(false);
                  }}
                >
                  <X className="text-gray-400 w-5 h-5 cursor-pointer  " />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
          {Sidebar}
    </div>
  );
}

export default Nav;
