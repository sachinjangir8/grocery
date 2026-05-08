import connectDB from "@/lib/db";
import Order from "@/model/order.model";
import User from "@/model/User.model";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        await connectDB();
        
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments({ role: "user" });
        const pendingOrders = await Order.countDocuments({ status: "pending" });
        
        const orders = await Order.find({ status: "delivered", isPaid: true });
        const totalEarnings = orders.reduce((acc, order) => acc + order.totalAmount, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = await Order.find({ createdAt: { $gte: today }, status: "delivered", isPaid: true });
        const todayEarnings = todayOrders.reduce((acc, order) => acc + order.totalAmount, 0);

        // Last 7 days earnings for chart
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0,0,0,0);
        
        const recentOrders = await Order.find({
            createdAt: { $gte: sevenDaysAgo },
            status: "delivered",
            isPaid: true
        });

        const earningsByDate: Record<string, number> = {};
        for(let i=0; i<7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            earningsByDate[d.toISOString().split('T')[0]] = 0;
        }

        recentOrders.forEach(order => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            if(earningsByDate[date] !== undefined) {
                earningsByDate[date] += order.totalAmount;
            }
        });

        const chartData = Object.keys(earningsByDate).sort().map(date => ({
            name: date,
            earnings: earningsByDate[date]
        }));

        return NextResponse.json({
            todayEarnings,
            totalEarnings,
            totalOrders,
            totalUsers,
            pendingOrders,
            chartData
        });

    } catch (error) {
        return NextResponse.json({ message: "Error fetching stats" }, { status: 500 });
    }
}
