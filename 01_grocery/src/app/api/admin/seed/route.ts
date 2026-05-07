import connectDB from "@/lib/db";
import Grocery from "@/model/grocery.model";
import Order from "@/model/order.model";
import User from "@/model/User.model";
import DeliveryAssignment from "@/model/deliveryAssignment.model";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await connectDB();

        // 1. Create Sample Groceries
        const sampleGroceries = [
            {
                name: "Fresh Red Apples",
                category: "Dairy & Eggs",
                price: "120",
                unit: "kg",
                description: "Sweet and crunchy organic red apples.",
                image: "https://media.istockphoto.com/id/184276818/photo/red-apple.jpg?s=612x612&w=0&k=20&c=v6FwO780XqA-0N8N7O9r-7_j7L_V-20O0O0O0O0O0O0="
            },
            {
                name: "Amul Butter",
                category: "Dairy & Eggs",
                price: "55",
                unit: "gram",
                description: "Pure dairy butter.",
                image: "https://media.istockphoto.com/id/1141680517/photo/butter-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=v6FwO780XqA-0N8N7O9r-7_j7L_V-20O0O0O0O0O0O0="
            },
            {
                name: "Organic Basmati Rice",
                category: "Rice, Atta & Grains",
                price: "150",
                unit: "kg",
                description: "Long grain aromatic basmati rice.",
                image: "https://media.istockphoto.com/id/153737841/photo/rice.jpg?s=612x612&w=0&k=20&c=v6FwO780XqA-0N8N7O9r-7_j7L_V-20O0O0O0O0O0O0="
            },
            {
                name: "Coca Cola",
                category: "Beverages & Drinks",
                price: "40",
                unit: "ml",
                description: "Refreshing cold drink.",
                image: "https://media.istockphoto.com/id/458464735/photo/coke.jpg?s=612x612&w=0&k=20&c=v6FwO780XqA-0N8N7O9r-7_j7L_V-20O0O0O0O0O0O0="
            }
        ];

        await Grocery.deleteMany({});
        const groceries = await Grocery.insertMany(sampleGroceries);

        // 2. Find a sample user
        const user = await User.findOne({ role: "user" });
        if (!user) return NextResponse.json({ message: "No user found to assign orders to. Please register a user first." }, { status: 400 });

        await Order.deleteMany({ user: user._id });
        // 3. Create Sample Orders
        const sampleOrders = [
            {
                user: user._id,
                items: [
                    {
                        grocery: groceries[0]._id,
                        name: groceries[0].name,
                        price: groceries[0].price,
                        unit: groceries[0].unit,
                        quantity: 2,
                        image: groceries[0].image
                    }
                ],
                totalAmount: 240,
                address: {
                    fullName: user.name,
                    mobile: user.mobile || "9999999999",
                    city: "New Delhi",
                    state: "Delhi",
                    pincode: "110001",
                    fullAddress: "123, Sample Street, New Delhi",
                    latitude: 28.6139,
                    longitude: 77.2090
                },
                paymentMethod: "cod",
                isPaid: false,
                status: "pending",
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                user: user._id,
                items: [
                    {
                        grocery: groceries[2]._id,
                        name: groceries[2].name,
                        price: groceries[2].price,
                        unit: groceries[2].unit,
                        quantity: 1,
                        image: groceries[2].image
                    }
                ],
                totalAmount: 150,
                address: {
                    fullName: user.name,
                    mobile: user.mobile || "9999999999",
                    city: "New Delhi",
                    state: "Delhi",
                    pincode: "110001",
                    fullAddress: "123, Sample Street, New Delhi",
                    latitude: 28.6139,
                    longitude: 77.2090
                },
                paymentMethod: "online",
                isPaid: true,
                status: "delivered",
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            }
        ];

        const createdOrders = await Order.insertMany(sampleOrders);

        // 4. Create a broadcast for delivery boys
        const deliveryBoy = await User.findOne({ role: "deliveryBoy" });
        if (deliveryBoy) {
            await DeliveryAssignment.deleteMany({ assignedTo: null });
            await DeliveryAssignment.create({
                order: createdOrders[0]._id,
                broadcastedTo: [deliveryBoy._id],
                status: "broadcasted"
            });
        }

        return NextResponse.json({ message: "Database seeded successfully with delivery assignments!" });

    } catch (error: any) {
        console.error("SEEDING ERROR:", error);
        return NextResponse.json({ 
            message: "Seed failed", 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
}
