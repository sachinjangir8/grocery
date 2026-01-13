import React from 'react'
import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import connectDB from '@/lib/db'
import Grocery from '@/model/grocery.model'
import GroceryItemCard from './GroceryItemCard'

async function UserDashBord() {
  // here we take the groceries from the database to display on the home page
  await connectDB()
  const Groceries = await Grocery.find({})
  const plangrocery = JSON.parse(JSON.stringify(Groceries))
  return (
    <>
      <HeroSection />
      {/* 2. Shop by Category Slider */}
      <CategorySlider />

      <div className='w-[90%] md:w-[80%] mx-auto mt-10 h-full '>
        <h2 className='text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center'>Popular Grocery Items</h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6'>
          {plangrocery.map((item: any, index: number) => (
            <GroceryItemCard key={index} grocery={item} />
          ))}
        </div>
      </div>

    </>
  )
}

export default UserDashBord
