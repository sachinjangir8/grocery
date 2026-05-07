import connectDB from "@/lib/db";
import DeliveryAssignment from "@/model/deliveryAssignment.model";
import Order from "@/model/order.model";
import User from "@/model/User.model";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDB();

    const { orderId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    order.status = status;
    let DeliveryBoysPayLoad: any[] = [];

    // If outForDelivery, handle delivery assignment
    if (status === "outForDelivery") {
      // Find or create assignment
      let deliveryAssignment = await DeliveryAssignment.findOne({ order: order._id });
      
      // Only broadcast if not already accepted
      if (!deliveryAssignment || deliveryAssignment.status === "broadcasted") {
        const { latitude, longitude } = order.address;

        let nearByDeliveryBoys = await User.find({
          role: "deliveryBoy",
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
              },
              $maxDistance: 50000,
            },
          },
        });

        // If no one is nearby, fallback to all delivery boys for testing
        if (nearByDeliveryBoys.length === 0) {
            nearByDeliveryBoys = await User.find({ role: "deliveryBoy" });
        }

        const nearByIds = nearByDeliveryBoys.map((boy: any) => boy._id);

        const busyIds = await DeliveryAssignment.find({
          assignedTo: { $in: nearByIds },
          status: { $nin: ["broadcasted", "completed"] },
        }).distinct("assignedTo");

        const busyIdSet = new Set(busyIds.map((b) => String(b)));

        const availableDeliveryBoys = nearByDeliveryBoys.filter(
          (boy: any) => !busyIdSet.has(String(boy._id))
        );

        const candidates = availableDeliveryBoys.map((boy: any) => boy._id);

        if (candidates.length > 0) {
            if (!deliveryAssignment) {
                deliveryAssignment = await DeliveryAssignment.create({
                    order: order._id,
                    broadcastedTo: candidates,
                    status: "broadcasted",
                });
            } else {
                deliveryAssignment.broadcastedTo = candidates;
                await deliveryAssignment.save();
            }

            order.assignment = deliveryAssignment._id;

            // Broadcast to socket server
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:5000'}/broadcast`, {
                    event: "deliveryAssignment",
                    data: {
                        assignmentId: deliveryAssignment._id,
                        order: await Order.findById(order._id).populate("items"),
                    },
                    users: candidates.map(id => String(id))
                });
            } catch (err) {
                console.error("Socket broadcast failed:", err);
            }
        }
      }
    }

    await order.save();
    await order.populate("user");

    // Also broadcast status update to the customer
    try {
        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:5000'}/broadcast`, {
            event: "orderStatusUpdate",
            data: {
                orderId: order._id,
                status: status
            },
            rooms: [`order_${order._id}`]
        });
    } catch (err) {
        console.error("Status update broadcast failed:", err);
    }

    return NextResponse.json(
      {
        message: "Order status updated successfully",
        status: order.status
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Order update error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
