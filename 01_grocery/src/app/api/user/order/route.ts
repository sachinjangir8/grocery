import connectDB from "@/lib/db";
import Order from "@/model/order.model";
import User from "@/model/User.model";
import { NextRequest, NextResponse } from "next/server";
// after creating the order model we made api to post order from frontend
export  async function POST(request: NextRequest) {
    try {
        await connectDB()
        // jb form se data aayegi toh usse destructure karenge
        const {userId,items,paymentMethod,totalAmount,address}=await request.json()
        if(!userId || !items || !paymentMethod || !totalAmount || !address){
            return NextResponse.json("Please provide all the required fields", { status: 400 });
        }
        const user=await User.findById(userId)
        if(!user) return NextResponse.json("User not found", { status: 404 });
        const neworder=await Order.create({user:userId,
            items,
            paymentMethod,
            totalAmount,
            address
        })
        return NextResponse.json(neworder, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: `place order failed due to ${error}` }, { status: 500 });
        
    }
}
