import { auth } from "@/auth";
import User from "@/model/User.model";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (request: NextRequest) => {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return new Response("Unauthorized user ", { status: 401 });
        }
        const user=await User.findOne({email:session.user?.email}).select("-password")
        if(!user)
            return new Response("User not found", { status: 404 });

        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
