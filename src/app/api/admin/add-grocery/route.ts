import { auth } from "@/auth";
import uploadOnCloudnary from "@/lib/Cloudinary";
import uploadOnCloud from "@/lib/Cloudinary";
import connectDB from "@/lib/db";
import Grocery from "@/model/grocery.model";
import { h1, h3 } from "motion/react-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
    try {
        await connectDB();
        const session=await auth()
        if(session?.user?.role!=="admin"){
            return NextResponse.json(
                {message:"admin error:  you are not the admin"},
                {status:400}
            )
        }
        
        const formdata=await request.formData()
        const name=formdata.get("name") as string
        const category=formdata.get("category") as string
        const unit=formdata.get("unit") as string
        const price=formdata.get("price") as string
        const file=formdata.get("image") as Blob | null

        let imgurl
        if(file){
            imgurl=await uploadOnCloudnary(file)

        }
        const grocery=await Grocery.create({
            name,category,unit,price,image:imgurl
        })
            return NextResponse.json(
                {grocery},
                {status:200}
            )

    } catch (error) {
            return NextResponse.json(
                {message:`add grocery error ${error}`},
                {status:500}
            )
    }
}