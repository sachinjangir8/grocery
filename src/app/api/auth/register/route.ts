import connectDB from "@/lib/db";
import User from "@/model/User.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest){
    try {
        await connectDB();
        const {name, email, password}=await request.json();
        const userexists=await User.findOne({email});
        if(userexists){
            return NextResponse.json({message: "User already exists please login"},
            {status: 400});
        }
        if(password.length<6){
            return NextResponse.json({message: "Password must be at least 6 characters"},
            {status: 400});
        }
        const hashedPassword=await bcrypt.hash(password, 10);
        const user=await User.create({name, email, password: hashedPassword});
        return NextResponse.json(
            {message: "User created successfully", user},
                {status: 200}
            );
    } catch (error) {
        return NextResponse.json({
            message: `Something went wrong ${error}`,   
        }, {status: 500});
    }
}
// name, email, password, mobile
// email check
// password 6 characters