import connectDB from "@/lib/db";
import DeliveryAssignment from "@/model/deliveryAssignment.model";
import Order from "@/model/order.model";
import User from "@/model/User.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const session = await auth();
        if (!session?.user || session.user.role !== "deliveryBoy") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { orderId, otp } = await request.json();
        const deliveryBoyId = session.user.id;
        
        const order = await Order.findById(orderId);
        if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

        if (order.otp !== otp) {
            return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
        }

        // Verify and complete
        order.otpVerified = true;
        order.status = "delivered";
        await order.save();

        const assignment = await DeliveryAssignment.findOne({ order: orderId, assignedTo: deliveryBoyId });
        if (assignment) {
            assignment.status = "completed";
            await assignment.save();
        }

        const user = await User.findById(deliveryBoyId);
        if (user) {
            user.activeOrder = null;
            await user.save();
        }

        return NextResponse.json({ message: "Delivery completed successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
