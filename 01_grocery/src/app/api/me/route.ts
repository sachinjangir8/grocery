import connectDB from "@/lib/db";
import { auth } from "@/auth";
import User from "@/model/User.model";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    }).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("API /me error:", error); // 🔥 IMPORTANT
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
