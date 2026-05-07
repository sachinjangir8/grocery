import connectDB from "@/lib/db";
import DeliveryAssignment from "@/model/deliveryAssignment.model";
import Order from "@/model/order.model";
import User from "@/model/User.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const session = await auth();
        if (!session?.user || session.user.role !== "deliveryBoy") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const deliveryBoyId = session.user.id;
        console.log("Fetching assignments for partner:", deliveryBoyId);
        
        // Find active assignment (one already accepted)
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: deliveryBoyId,
            status: { $in: ["assigned", "arrived"] }
        }).populate({
            path: 'order',
            populate: {
                path: 'user',
                model: 'User',
                select: 'name mobile location email'
            }
        });

        // Also find available broadcasts for this boy
        const availableBroadcasts = await DeliveryAssignment.find({
            broadcastedTo: deliveryBoyId,
            status: "broadcasted"
        }).populate({
            path: 'order',
            populate: {
                path: 'user',
                model: 'User',
                select: 'name mobile location email'
            }
        });

        console.log("Found broadcasts:", availableBroadcasts.length);
        return NextResponse.json({ assignment, availableBroadcasts }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
