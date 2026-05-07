import connectDB from "@/lib/db";
import Chat from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        await connectDB();
        const { roomId } = await params;
        
        const messages = await Chat.find({ roomId })
            .populate("senderId", "name role")
            .sort({ createdAt: 1 });

        const formattedMessages = messages.map(m => ({
            sender: m.senderId.role === "deliveryBoy" ? "Delivery" : "Customer",
            text: m.message,
            timestamp: m.createdAt
        }));

        return NextResponse.json({ messages: formattedMessages }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching chat history" }, { status: 500 });
    }
}
