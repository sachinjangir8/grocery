import mongoose from "mongoose";
const MONGODB_URL = process.env.MONGODB_URL as string;

if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined");
}

// each api call will connect to the database and then return the connection so we need to use a global variable to store the connection

let cached=global.mongoose;
if(!cached){
    cached={
        conn: null,
        promise: null,
    }
    global.mongoose=cached;
}
// connect db

async function connectDB(){
    if(cached.conn){
        return cached.conn;
    }
    if(!cached.promise){
        cached.promise=mongoose.connect(MONGODB_URL).then((conn)=>conn.connection);
    }
    try {
        const conn=await cached.promise;
        return conn;
    } catch (error) {
        console.error("Error connecting to database", error);
        throw error;
    }
}

export default connectDB;