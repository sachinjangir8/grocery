// 'use client'
// import React from "react";
// import { LatLngExpression } from "leaflet";
// import { MapContainer, TileLayer } from "react-leaflet";
// // IMPORTANT: You must import the CSS for the map to render correctly
// import "leaflet/dist/leaflet.css" 

// export default function MapView({ position }: { position: [number, number] | null }) {
//   if (!position) return null;
  
//   return (
//     <div className="w-full h-64 rounded-xl overflow-hidden border"> 
//       <MapContainer 
//         center={position as LatLngExpression} 
//         zoom={13} 
//         scrollWheelZoom={false} 
//         className="w-full h-full"
//       >
//         <TileLayer 
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//       </MapContainer>
//     </div>
//   );
// }