'use client'
import { AppDispatch } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

function UseGetme() {
    const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    const fetchData = async () => {
    try {
      const response = await axios.get('/api/me')
    //   console.log("User Data from useGetme:", response.data)
    // now we will store the user data in the redux store
        dispatch(setUserData(response.data))
    } catch (error) {
      console.error('There was an error!', error);
    }
  }
  fetchData()
}, [])
}

export default UseGetme
            