import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";
import { number } from "motion";

interface IGrocery {
  _id: mongoose.Types.ObjectId;
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
    cartData:IGrocery[] ,
    subtotal: number,
    deliveryfee: number,
    finaltotal: number,

}

const initialState:IUserSlice={
    cartData: [] ,
    subtotal: 0,
    deliveryfee: 40,
    finaltotal: 40,
    
}

const cartSlice=createSlice({
    name:"user",
    initialState,
    // reducers is used for how to update the state or how to change the state of the store using actions (reducer will change the data state in it)
    reducers:{
        setCartData:(state,action:PayloadAction<IGrocery>)=>{
            state.cartData.push(action.payload)
            cartSlice.caseReducers.calculateTotal(state)
        },
        increaseQuantity:(state,action:PayloadAction<mongoose.Types.ObjectId>)=>{
            const item=state.cartData.find((item)=>item._id===action.payload)
            if(item){
                item.quantity+=1
            }
            cartSlice.caseReducers.calculateTotal(state)
        },
        decreaseQuantity:(state,action:PayloadAction<mongoose.Types.ObjectId>)=>{
            const item=state.cartData.find((item)=>item._id===action.payload)
            if(item){
                item.quantity-=1
                if(item.quantity<=0){
                    state.cartData=state.cartData.filter((item)=>item._id!==action.payload)
                }
            }
            cartSlice.caseReducers.calculateTotal(state)
        },
        removeItem:(state,action:PayloadAction<mongoose.Types.ObjectId>)=>{
            state.cartData=state.cartData.filter((item)=>item._id!==action.payload)
            cartSlice.caseReducers.calculateTotal(state)
        },
        calculateTotal:(state)=>{
            state.subtotal=state.cartData.reduce((total, item)=>total+Number(item.price)*item.quantity,0)
            state.deliveryfee=state.subtotal>100?0:40
            state.finaltotal=state.subtotal+state.deliveryfee
        },
    },
})

export const {setCartData, increaseQuantity, decreaseQuantity , removeItem , calculateTotal}=cartSlice.actions
export default cartSlice.reducer
