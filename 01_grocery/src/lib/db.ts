import mongoose from "mongoose";
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
    const MONGODB_URL = process.env.MONGODB_URL;

    if (!MONGODB_URL) {
        console.error("MONGODB_URL is not defined in environment variables");
        // During build, we might not want to crash the whole process if this is called during static analysis
        if (process.env.NODE_ENV === 'production') {
            console.warn("Continuing without DB connection for now...");
            return;
        }
        throw new Error("MONGODB_URL is not defined");
    }

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