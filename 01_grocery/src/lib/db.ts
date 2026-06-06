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
        console.warn("MONGODB_URL is not defined in environment variables.");
        // During the build phase or production, do not crash the compilation process.
        if (
            process.env.NEXT_PHASE === 'phase-production-build' ||
            process.env.NODE_ENV === 'production' ||
            process.env.NEXT_PHASE
        ) {
            console.warn("Continuing without database connection during build...");
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