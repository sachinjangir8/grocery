import { createSlice } from "@reduxjs/toolkit";
import mongoose from "mongoose";

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

interface IUserSlice{
    userData:IUser | null
    sachin: string;
}

const initialState:IUserSlice={
    userData: {} as IUser,
    sachin: "sachin",
    
}

const userSlice=createSlice({
    name:"user",
    initialState,
    // reducers is used for how to update the state or how to change the state of the store using actions (reducer will change the data state in it)
    reducers:{
        setUserDate:(state,action)=>{
            state.userData=action.payload
        }
    },
})

export const {setUserDate}=userSlice.actions
export default userSlice.reducer
