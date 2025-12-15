import mongoose from "mongoose";
const MONGODB_URL = process.env.MONGODB_URL as string;
interface IUser {
    _id?: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    mobile?: string;
    role: "user" | "admin" | "deliveryBoy";
    image: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
             type: String, 
             required: true,
              unique: true 
            },
        password: {
             type: String,
              required: false 
            },
        mobile: { 
            type: String,
             required: false,
              unique: false 
            },
        role: {
            type: String,
            required: true,
            enum: ["user", "admin", "deliveryBoy"],
            default: "user",
        },
        image: {
            type: String,
            required: false,
        }
    },
    { timestamps: true }
);
// in ts we use it beacuse of it create a new model if not exists otherwise it will throw an error beacuse of the hot reloading
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User; 

