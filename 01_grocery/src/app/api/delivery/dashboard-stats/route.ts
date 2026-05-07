import connectDB from "@/lib/db";
import DeliveryAssignment from "@/model/deliveryAssignment.model";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const session = await auth();
        if (session?.user?.role !== "deliveryBoy") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const deliveryBoyId = session.user.id;

        const assignments = await DeliveryAssignment.find({ 
            assignedTo: deliveryBoyId, 
            status: "completed" 
        });

        const totalCompleted = assignments.length;
        const totalEarnings = totalCompleted * 40; // ₹40 per order

        // Get stats for last 7 days for a simple chart
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        const chartData = last7Days.map(date => {
            const dayAssignments = assignments.filter(a => 
                a.updatedAt && a.updatedAt.toISOString().split('T')[0] === date
            );
            return {
                name: date.slice(5), // MM-DD
                deliveries: dayAssignments.length,
                earnings: dayAssignments.length * 40
            };
        });

        return NextResponse.json({
            totalCompleted,
            totalEarnings,
            chartData
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
