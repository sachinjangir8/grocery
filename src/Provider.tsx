'use client'
import { SessionProvider } from 'next-auth/react'
import React from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Provider({children}: {children:React.ReactNode}) {
  return (
    <div>
        <SessionProvider>
        {children}
        <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme="colored" // Using "colored" will give you the green/red backgrounds automatically
      />
        </SessionProvider>
    </div>
  )
}

export default Provider
