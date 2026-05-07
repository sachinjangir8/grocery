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

        const { assignmentId } = await request.json();
        const deliveryBoyId = session.user.id;

        const assignment = await DeliveryAssignment.findById(assignmentId);
        
        if (!assignment) return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
        
        if (assignment.status !== "broadcasted") {
            return NextResponse.json({ message: "Assignment already taken" }, { status: 400 });
        }

        // Accept the assignment
        assignment.status = "assigned";
        assignment.assignedTo = deliveryBoyId;
        assignment.acceptedAt = new Date();
        await assignment.save();

        const order = await Order.findById(assignment.order);
        if (order) {
            order.assignedDeliveryBoy = deliveryBoyId;
            await order.save();
        }

        const user = await User.findById(deliveryBoyId);
        if (user) {
            user.activeOrder = order?._id;
            await user.save();
        }

        return NextResponse.json({ message: "Assignment accepted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
