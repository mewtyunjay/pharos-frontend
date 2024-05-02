// import React from 'react';
// import { useParams, useLocation } from 'react-router-dom'; // To access URL parameters and navigation state
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// const MapPage = () => {
//   const { role } = useParams<{ role: string }>();  // Extract the role parameter from the URL
//   const location = useLocation();  // Access state passed through navigation
//   const { roomCode, additionalData } = location.state || {};  // Destructure state if passed

//   // Default position, adjust based on your application needs or based on passed state
//   const position: L.LatLngTuple = [40.618709, -74.030437];  // Latitude, Longitude

//   // Example conditional content based on role
//   const roleSpecificContent = role === 'leader'
//     ? 'You are leading the room. Room code: ' + roomCode
//     : 'You are participating in the room. Leader’s room code: ' + roomCode;

//   return (
//     <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//       />
//       <Marker position={position}>
//         <Popup>
//           {roleSpecificContent} <br />
//           Additional info: {additionalData}
//         </Popup>
//       </Marker>
//     </MapContainer>
//   );
// };

// export default MapPage;