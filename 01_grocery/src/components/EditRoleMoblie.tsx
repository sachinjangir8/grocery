'use client'
import React from 'react'
import { motion, scale } from "motion/react"
import { ArrowRight, icons } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
function EditRoleMoblie() {
  const [role,setRole]=React.useState([
    // id me vo jo backend me bhejna hh
    {id:"user",label:"User",icons:icons.User},
    {id:"admin",label:"Admin",icons:icons.ShieldCheck},
    {id:"deliveryBoy",label:"Delivery",icons:icons.Truck},
  ])
  const [selectedRole,setSelectedRole]=React.useState<string| null>(null);
  const [mobile,setMobile]=React.useState<string>("");
  const router=useRouter()
  const{update}=useSession()
  const handleedit=async()=>{
    try {
      const resuilt=await axios.post("/api/user/edit-role-mobile",{
        mobile,
        role:selectedRole

      })
      await update({role:selectedRole})
      // console.log("Response from edit role mobile API:", resuilt.data);
      if(resuilt.status===200){
        // redirect to home page
        // window.location.href="/";
        router.push("/")
        
      }
    } catch (error) {
      
    }
  }


  return (
    <div className='flex flex-col min-h-screen items-center p-6 w-full bg-white ' >
      <motion.h1
      initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className='text-3xl md:text-4xl font-extrabold text-green-700 text-center mt-8 '
        >
      <h2>Select Your Role </h2>
      </motion.h1>
      <div className='flex flex-col md:flex-row justify-center gap-6 mt-10 ' >
        {
          role.map((roleItem)=>{
            const Icon=roleItem.icons;
            const isSelected=selectedRole===roleItem.id;
            return(
              <motion.div
              key={roleItem.id}
              whileTap={{scale:0.8}}
              onClick={()=>{setSelectedRole(roleItem.id)}}
              className={`flex flex-col items-center justify-center w-48 h-44 border-2 rounded-lg cursor-pointer transition-all hover:border-green-600 
              ${isSelected ? "bg-green-300 text-black border-green-600 " : "bg-white border-gray-300 hover:bg-green-100"}`}
          >
                <Icon/>
                <span>{roleItem.label}</span>
              </motion.div>
            )})
        }
      </div>
{/* form of mobile  */}
      <motion.div
      initial={{ opacity: 0  }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1,delay:0.5 }}
      className="flex flex-col items-center justify-center mt-10 ">
        <label htmlFor="mobile" className='text-gray-800 font-md mb-2 ' >Enter Your Moblie No.</label>
        <input type="tel" id='mobile' 
        className='w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ' 
        placeholder='+91 98765 43210'
        onChange={(e)=>{setMobile(e.target.value)}}
        />
      </motion.div>
        
        <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        disabled={mobile.length!==10 || !selectedRole }
        className={`flex mt-10 px-6 py-3 text-black rounded-lg transition-colors items-center gap-2
          ${
            selectedRole
              ? "bg-green-600 hover:bg-green-700 cursor-pointer"
              : "bg-gray-300 cursor-not-allowed opacity-50"
          }`}
        onClick={handleedit}
      >
        Go to home <ArrowRight />
      </motion.button>
    </div>
  )
}

export default EditRoleMoblie
