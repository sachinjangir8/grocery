import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import axios from 'axios';
dotenv.config();
const app=express();
app.use(express.json());

app.post("/broadcast", (req, res) => {
    const { event, data, rooms, users } = req.body;
    if (rooms) {
        rooms.forEach((r) => io.to(r).emit(event, data));
    } else if (users) {
        users.forEach((u) => io.to(u).emit(event, data));
    } else {
        io.emit(event, data);
    }
    res.json({ success: true });
});

const server=http.createServer(app);
const port=process.env.PORT || 5000;

const io=new Server(server,{
    // here we will tell from which origin the request is coming and which methods are allowed
    cors:{
        origin:process.env.NEXT_BASE_URL || "http://localhost:3000",
        methods:["GET","POST"]
    }
})

io.on("connection",(socket)=>{
    // console.log(`User connected: ${socket.id}`);
    socket.on("identity",async(userId)=>{
        socket.join(userId);
        console.log(`User socketid:  ${socket.id} joined userid:  ${userId}`);
        await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`,{
            userId: userId,
            socketId:socket.id
        })
    })

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("updateLocation",async({userId,latitude,longitude,orderId})=>{
        const location={
            type:"Point",
            coordinates:[longitude,latitude]
        }
        
        // Broadcast to anyone tracking this order
        if (orderId) {
            io.to(`order_${orderId}`).emit("locationUpdate", { userId, latitude, longitude });
        }

        await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/updateLocation`,{
            userId:userId,
            location:location
        })
    })

    socket.on("sendMessage", async({ roomId, sender, senderId, text }) => {
        io.to(roomId).emit("receiveMessage", { sender, text, timestamp: new Date() });
        
        // Persist to DB
        try {
            await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/save-message`, {
                roomId,
                senderId,
                message: text
            });
        } catch (err) {
            console.error("Error persisting chat:", err);
        }
    });

    socket.on("disconnect",()=>{
        console.log(`User disconnected: ${socket.id}`);
    })
})

server.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
