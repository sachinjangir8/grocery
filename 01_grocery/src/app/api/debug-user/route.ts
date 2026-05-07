import connectDB from "@/lib/db";
import User from "@/model/User.model";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ message: "No session user" }, { status: 401 });
        const user = await User.findById(session.user.id);
        return NextResponse.json({ session, dbUser: user }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
