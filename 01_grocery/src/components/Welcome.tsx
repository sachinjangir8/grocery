'use client'
import React from 'react'
import { motion } from "motion/react"
import { ArrowRight, Bike, ShoppingBasket } from 'lucide-react'
type proptype={
    nextstep:(step:number)=>void
}
function Welcome({nextstep}: proptype) {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen test-center p-6' >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2 }}
        className='flex items-center gap-3 '
      >
        <ShoppingBasket className='w-10 h-10 text-yellow-300  ' ></ShoppingBasket>
        <h1 className='text-4xl md:text-5xl font-extrabold text-yellow-700 ' >welcome to the grocery </h1>
      </motion.div>
      <motion.p
      initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2 }}
        className='mt-4 text-lg md:text-xl text-gray-600 text-center max-w-md '
       >
        your one-stop shop for fresh produce and everyday essentials.
      </motion.p >
      <motion.div
      initial={{ opacity: 0, scale:0.5 }}
        animate={{ opacity: 1, scale:1 }}
        transition={{ duration: 2 }}
        className='mt-10 flex items-center gap-10 '>
        <ShoppingBasket className='w-24 h-24 md:h-32 text-yellow-400 drop-shadow-md ' ></ShoppingBasket>
        <Bike className='w-24 h-24 md:h-32 text-green-300 drop-shadow-md ' ></Bike>
      </motion.div>
      <motion.button
      initial={{ opacity: 0, y:20 }}
        animate={{ opacity: 1, y:0 }}
        transition={{ duration: 2 }}
        className='mt-10 px-6 py-3 bg-yellow-500 text-white rounded-4xl flex items-center gap-2 hover:bg-yellow-600 transition-colors duration-300 cursor-pointer '
        onClick={()=>nextstep(2)}
        >
        Next
        <ArrowRight></ArrowRight>
      </motion.button>
    </div>
  )
}

export default Welcome
