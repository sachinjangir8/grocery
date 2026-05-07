'use client';
import React, { useEffect } from "react";
import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Fix missing marker icons
if (typeof window !== "undefined") {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

// Component to handle map center updates
function ChangeView({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface MapViewProps {
    position?: [number, number] | null;
    partnerPosition?: [number, number] | null;
    customerPosition?: [number, number] | null;
}

export default function MapView({ position, partnerPosition, customerPosition }: MapViewProps) {
  const centerPosition = position || partnerPosition || customerPosition || [28.6139, 77.2090];
  
  return (
    <div className="w-full h-full relative z-0"> 
      <MapContainer 
        center={centerPosition as LatLngExpression} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ width: '100%', height: '100%' }}
      >
        <ChangeView center={centerPosition as LatLngExpression} />
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {position && (
            <Marker position={position as LatLngExpression}>
                <Popup>Location</Popup>
            </Marker>
        )}

        {partnerPosition && (
            <Marker 
                position={partnerPosition as LatLngExpression}
                icon={new L.Icon({
                    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
                    iconSize: [35, 35],
                    iconAnchor: [17, 35]
                })}
            >
                <Popup>Partner is here</Popup>
            </Marker>
        )}

        {customerPosition && (
            <Marker position={customerPosition as LatLngExpression}>
                <Popup>Delivery Destination</Popup>
            </Marker>
        )}

        {partnerPosition && customerPosition && (
            <Polyline 
                positions={[partnerPosition, customerPosition]} 
                color="#16a34a" 
                weight={4}
                dashArray="10, 10"
                opacity={0.6}
            />
        )}
      </MapContainer>
    </div>
  );
}