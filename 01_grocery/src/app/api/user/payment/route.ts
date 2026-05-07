import connectDB from "@/lib/db";
import Order from "@/model/order.model";
import User from "@/model/User.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
"last me ! mtlb ye aapko milegi hi milegi "
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
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

        const session=await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${process.env.NEXT_BASE_URL}/user/order-success`,
            cancel_url: `${process.env.NEXT_BASE_URL}/user/order-cancel`,
            line_items: [{
                price_data:{
                    currency: 'inr',
                    product_data: { 
                        name: 'grocery wow' 
                    },
                    unit_amount: totalAmount*100,
                },
                quantity: 1,
            }],
            metadata: { orderId: neworder._id.toString() },
        })
        return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: `order payment failed ${error}` }, { status: 500 });
    }
}
