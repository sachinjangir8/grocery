import {ArrowLeft,EyeClosed, EyeClosedIcon,EyeIcon,EyeOff,Key,Leaf, Loader2, LogIn,Mail,User} from "lucide-react";
import React from "react";
import { motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";
import google from "@/assets/google.png";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
type proptype = {
  prevstep: (step: number) => void;
};

function Registerform({ prevstep }: proptype) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router=useRouter();
  const handleregister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      router.push("/login");
      setLoading(false);
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      setLoading(false);  
      alert(message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative ">
      <div
        className="absolute top-6 left-6 flex items-center gap-2 text-green-500 hover:text-green-900 transition-colors cursor-pointer "
        onClick={() => prevstep(1)}
      >
        <ArrowLeft className="w-5 h-5"> </ArrowLeft>
        <span className="font-medium">back</span>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-2xl md:text-5xl font-extrabold text-green-700 "
      >
        create account
      </motion.h1>
      <p className="text-gray-800 mb-8 flex items-center">
        join your comfert today <Leaf className="w-5 h-5 text-green-500"></Leaf>
      </p>
      <motion.form
        onSubmit={handleregister}
        className="flex flex-col gap-5 w-full max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="relative">
          <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500"></User>
          <input
            type="text"
            placeholder="username"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 "
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500"></Mail>
          <input
            type="text"
            placeholder="email"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 "
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <Key className="absolute left-3 top-3.5 w-5 h-5 text-gray-500"></Key>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="password"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 "
            onChange={(e) => setPassword(e.target.value)}
          />
          {showPassword ? (
            <EyeClosed
              className="absolute right-3 top-3.5 w-5 h-5 text-grey-500 
            cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <EyeIcon
              className="absolute right-3 top-3.5 w-5 h-5
             text-grey-500 cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {(() => {
          const isDisabled = name && email && password;

          return (
            <button
              type="submit"
              disabled={!isDisabled  || loading}
              className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2
        ${
          isDisabled
            ? "bg-green-400 hover:bg-green-500 text-white"
            : "bg-gray-500 text-gray-400 cursor-not-allowed"
        } `}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin " ></Loader2> : " register"}
            </button>
          );
        })()}
        <div className="flex items-center text-grey-400 text-sm mt-2 ">
          <span className="flex-1 h-px bg-gray-400 mr-1"></span>
          OR
          <span className="flex-1 h-px bg-gray-400 ml-1"></span>
        </div>

        <div
        onClick={()=>{signIn("google",{callbackUrl:"/"})}}
          className="w-full font-semibold py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors
         duration-200 shadow-md inline-flex items-center justify-center gap-2 cursor-pointer "
        >
          <Image src={google} alt="google logo" className="w-5 h-5 " />
          register with google
        </div>
      </motion.form>
    

      <p className="text-gray-700 mt-6 text-sm flex items-center gap-1 cursor-pointer "
        onClick={()=>router.push('/login')} >
        already have an account ?<LogIn className="w-4 h-4"></LogIn>{" "}
        <span className="text-green-700  ">sign in</span>{" "}
      </p>
    </div>
  );
}

export default Registerform;
