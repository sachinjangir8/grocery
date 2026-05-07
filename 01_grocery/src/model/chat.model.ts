import mongoose from "mongoose";

export interface IChat {
    _id?: mongoose.Types.ObjectId;
    roomId: string;
    senderId: mongoose.Types.ObjectId;
    message: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const chatSchema = new mongoose.Schema<IChat>({
    roomId: {
        type: String,
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);
export default Chat;
