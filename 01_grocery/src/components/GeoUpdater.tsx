"use client"
import { getSocket } from '@/lib/socket'
import React, { useEffect } from 'react'

function GeoUpdater({ userId, activeOrderId }: { userId: string, activeOrderId?: string }) {
    const socket = getSocket()
    useEffect(() => {
        if(!userId) return
        socket.emit('identity', userId)
        
        if(typeof navigator === 'undefined' || !navigator.geolocation) return
        
        const watcher=navigator.geolocation.watchPosition((position) => {
            socket.emit('updateLocation', {
                userId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                orderId: activeOrderId
            })
        }, (error) => {
            console.error("Error getting user position:", error);
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
        
        return () => {
            if (typeof navigator !== 'undefined') navigator.geolocation.clearWatch(watcher);
        }
    }, [userId, activeOrderId, socket])
  return null
}

export default GeoUpdater
