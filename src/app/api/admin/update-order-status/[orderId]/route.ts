import connectDB from "@/lib/db";
import Order from "@/model/order.model";
import User from "@/model/User.model";
import { NextResponse } from "next/server";

export async function POST(request: NextResponse, { params }: { params: { orderId: string } }) {
    try {
        await connectDB();
        const { orderId } = await params;
        const status = await request.json();
        const order = await Order.findById(orderId).populate('user');
        if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
        order.status = status;
        await order.save();
        return NextResponse.json({ message: "Order status updated successfully" }, { status: 200 });
        let availableDeliveryBoys: any = [];
        if (status === "outForDelivery" && !order.assignment) {
            availableDeliveryBoys = await User.find({
                role: "deliveryBoy",
                availability: true,
            });
        }
    } catch (error) {
        
    }
}
