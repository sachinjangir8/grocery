"use client";

import React, { useEffect } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix missing marker icons
const markerIcon = typeof window !== "undefined" ? new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
}) : null;

interface DragableMarkerProps {
    position: [number, number];
    setPosition: (pos: [number, number]) => void;
}

export default function DragableMarker({ position, setPosition }: DragableMarkerProps) {
    const map = useMap();

    useEffect(() => {
        if (!position) return;
        map.setView(position, 15, { animate: true, duration: 0.5 });
    }, [position, map]);

    if (!position || !markerIcon) return null;

    return (
        <Marker
            position={position}
            icon={markerIcon}
            draggable
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target as L.Marker;
                    const { lat, lng } = marker.getLatLng();
                    setPosition([lat, lng]);
                },
            }}
        />
    );
}
