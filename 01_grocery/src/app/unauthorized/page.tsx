import { AccessibilityIcon } from 'lucide-react'
import React from 'react'

function Unauthorized() {
  return (
    <div className='flex flex-col items-center justify-center h-screen' >
      <h1 className='text-3xl font-bold text-red-950 '  >
        <img className='rounded-4xl ' src="https://media.istockphoto.com/id/1401548924/vector/access-denied-in-cartoon-style-flat-icon-sign-forbidden.jpg?s=612x612&w=0&k=20&c=0LJ4OTKXGjgrojTumA9-lU1aqETWnnKQUOZDDB1GrRA=" alt="" />
         </h1>
      <p className='mt-10 text-5xl text-red-700' >You can not access this Page</p>
    </div>
  )
}

export default Unauthorized
