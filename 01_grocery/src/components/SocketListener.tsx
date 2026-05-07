"use client";

import React, { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";

export default function SocketListener() {
  const { data: session } = useSession();
  const socket = getSocket();

  useEffect(() => {
    if (!session?.user?.id) return;

    const userId = session.user.id;
    socket.emit("identity", userId);

    socket.on("orderStatusUpdate", (data: any) => {
      toast.info(`Order Status Updated: ${data.status.replace(/([A-Z])/g, ' $1').toUpperCase()}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    socket.on("deliveryAssignment", (data: any) => {
      if (session?.user?.role === "deliveryBoy") {
        toast.success("New Delivery Request Available!", {
          position: "top-center",
          autoClose: 10000,
        });
      }
    });

    // Geolocation Tracking
    let watcher: number;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
        watcher = navigator.geolocation.watchPosition((position) => {
            socket.emit("updateLocation", {
                userId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                // If the user has an active order in session, it might be stale,
                // but for broadcast purposes, the DeliveryBoyDashboard will handle the specific order room.
            });
        }, (error) => console.error(error), { enableHighAccuracy: true, timeout: 10000 });
    }

    return () => {
      socket.off("orderStatusUpdate");
      socket.off("deliveryAssignment");
      if (watcher && typeof navigator !== 'undefined') navigator.geolocation.clearWatch(watcher);
    };
  }, [session, socket]);

  return <ToastContainer />;
}
