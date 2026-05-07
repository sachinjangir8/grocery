'use client'
import { AppDispatch } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

function UseGetme() {
    const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    //   console.log("User Data from useGetme:", response.data)
    // now we will store the user data in the redux store using  dispatch(setUserData(res.data))
  axios.get("/api/me", { withCredentials: true })
    .then(res => dispatch(setUserData(res.data)))
    .catch(console.error);
}, []);

}

export default UseGetme
            