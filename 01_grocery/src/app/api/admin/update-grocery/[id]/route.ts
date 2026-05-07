import connectDB from "@/lib/db";
import Grocery from "@/model/grocery.model";
import { auth } from "@/auth";
import uploadOnCloudnary from "@/lib/Cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const session = await auth();
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const formdata = await request.formData();
        
        const name = formdata.get("name") as string;
        const category = formdata.get("category") as string;
        const unit = formdata.get("unit") as string;
        const price = formdata.get("price") as string;
        const file = formdata.get("image") as Blob | null;

        const updateData: any = { name, category, unit, price: Number(price) };

        if (file && file.size > 0) {
            const imgurl = await uploadOnCloudnary(file);
            if (imgurl) {
                updateData.image = imgurl;
            }
        }

        const grocery = await Grocery.findByIdAndUpdate(id, updateData, { new: true });

        return NextResponse.json({ message: "Grocery updated successfully", grocery }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
