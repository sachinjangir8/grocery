import connectDB from "@/lib/db";
import Order from "@/model/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("🔥 Event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("Session metadata:", session.metadata);

    if (!session.metadata?.orderId) {
      console.error("❌ orderId missing in metadata");
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(
      session.metadata.orderId,
      { isPaid: true },
      { new: true }
    );

    console.log("✅ Order updated:", order);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

