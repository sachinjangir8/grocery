import connectDB from "@/lib/db";
import Order from "@/model/order.model";
import User from "@/model/User.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const session = await auth();
        if (!session?.user || session.user.role !== "deliveryBoy") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { orderId } = await request.json();
        
        const order = await Order.findById(orderId).populate('user');
        if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        order.otp = otp;
        await order.save();

        // Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: order.user.email,
            subject: 'Delivery OTP for your Grocery Order',
            text: `Your delivery OTP is: ${otp}. Please share this with the delivery executive to receive your order.`
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
