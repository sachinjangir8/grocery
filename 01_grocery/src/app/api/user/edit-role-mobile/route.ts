import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/model/User.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const {mobile,role}= await request.json(); 
        // current user me update krna hai
        const session = await auth();
        if(!session?.user?.id){
            return NextResponse.json({
                message:"Unauthorized"},
                {status:401}
            );
        }
        const user=await User.findOneAndUpdate({email:session?.user?.email},{mobile,role},{new:true});
        return NextResponse.json(
            {message:"User role and mobile updated successfully",user},
            {status:200}
        );
    } catch (error) {
        console.log("Error in updating user role and mobile:", error);
        return NextResponse.json(
            {message:"Internal Server Error"},
            {status:500}
        );
    }

}