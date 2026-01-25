import connectDB from "@/lib/db";
import Order from "@/model/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const orders = await Order.find({}).populate('user');
        return NextResponse.json({ message: "Orders fetched successfully", orders }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "get orders failed : " + error }, { status: 500 });
        
    }
}