import connectDB from "@/lib/db";
import Chat from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { roomId, senderId, message } = await request.json();
        
        const newChat = await Chat.create({
            roomId,
            senderId,
            message
        });

        return NextResponse.json({ success: true, chat: newChat }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error saving chat" }, { status: 500 });
    }
}
