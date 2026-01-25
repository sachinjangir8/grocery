import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Order from "@/model/order.model";
import { NextResponse } from "next/server";

export async function GET(request:NextResponse) {
    try {
        await connectDB();
        const session=await auth();
        const orders=await Order.find({user:session?.user?.id}).populate('user');
        if (!orders) {
            return NextResponse.json({message:"No orders found"},{status:404});
        } else {
            return NextResponse.json({message:"Orders found",orders},{status:200});
        }
    } catch (error) {
        return NextResponse.json({message:"Internal Server Error my orders route : "+error},{status:500});
    }
}