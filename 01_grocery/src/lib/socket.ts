import { NextRequest } from "next/server";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
    if (typeof window === "undefined") return { on: () => {}, off: () => {}, emit: () => {} } as any;
    if (!socket){
        // connecting the socket to the server
        socket=io(process.env.NEXT_PUBLIC_SOCKET_SERVER)
    }
    return socket;
};
