import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";

interface IGrocery {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: string;
  unit: string;
  quantity: number;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserSlice{
    cartData:IGrocery[] 
    cart: string;
}

const initialState:IUserSlice={
    cartData: [] ,
    cart: "sachin",
    
}

const cartSlice=createSlice({
    name:"user",
    initialState,
    // reducers is used for how to update the state or how to change the state of the store using actions (reducer will change the data state in it)
    reducers:{
        setCartData:(state,action:PayloadAction<IGrocery>)=>{
            state.cartData.push(action.payload)
        },
        increaseQuantity:(state,action:PayloadAction<mongoose.Types.ObjectId>)=>{
            const item=state.cartData.find((item)=>item._id===action.payload)
            if(item){
                item.quantity+=1
            }
        },
        decreaseQuantity:(state,action:PayloadAction<mongoose.Types.ObjectId>)=>{
            const item=state.cartData.find((item)=>item._id===action.payload)
            if(item){
                item.quantity-=1
                if(item.quantity<=0){
                    state.cartData=state.cartData.filter((item)=>item._id!==action.payload)
                }
            }
        },
    },
})

export const {setCartData, increaseQuantity, decreaseQuantity}=cartSlice.actions
export default cartSlice.reducer
