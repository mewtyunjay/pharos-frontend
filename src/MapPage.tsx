import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useParams, useLocation } from 'react-router-dom';

// const API_KEY="v1.public.eyJqdGkiOiJhMjA3ZGE4Mi1jZGVlLTRmM2QtYjNjYS0xODdmOThmNmZiZjAifYxT_1ctUYCK7LreWJNotc8ZFcCjFS9wTmy-4N7ZUJL3vH9eyjFjxFUNFzr_Qe-4OaBoozhxkfGc5afE-FjgM2mqITlXPCTMi3YwdH7x6PBfnLhw5DIvhKkpT11dOFt6ysNRMB8WauPuy2L36ynCjq9XhegidKYEemlE8cCwUigr4bcueBuXUXCzaTDuqBxLOAI6g1E4-Uj793alvz9x1LEGHLYMR4Wy4aexBrwDDUeHty01BgDcIqhvWZiLEVliYCKNbUMjt5-LVPxXPxRnngrhIrarqr9jN0zmMFxpD1mQ10XSKyqT67LfP_MikzANe3fmXtI3HHE16SYW2_aA5dg.ZWU0ZWIzMTktMWRhNi00Mzg0LTllMzYtNzlmMDU3MjRmYTkx";
const API_KEY = process.env.REACT_APP_AWS_MAP_API_KEY

const MapPage = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { role } = useParams<{ role: string }>();
  const location = useLocation();
  const { roomCode, token } = location.state || {};
  const [leaderLocation, setLeaderLocation] = useState<GeolocationCoordinates | null>(null);
  const [participantLocation, setParticipantLocation] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: `https://maps.geo.us-east-1.amazonaws.com/maps/v0/maps/HEREmapTest/style-descriptor?key=${API_KEY}`,
        center: [-74.304017, 40.618709],  // Default center
        zoom: 14
      });

      mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-left');
    }

    const ws = new WebSocket(`ws://127.0.0.1:8080/join?token=${token}`);
    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = event => {
      try {
        const message = JSON.parse(event.data);
        const leader = message.data.leaders[0];
        const newLeaderLocation = { latitude: leader.location.latitude, longitude: leader.location.longitude };
        setLeaderLocation(newLeaderLocation);
      } catch (error) {
        console.error('Error parsing message from WebSocket:', error);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(position => {
        const newParticipantLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setParticipantLocation(newParticipantLocation);
      }, error => {
        console.log('Error getting geolocation:', error);
      }, {
        enableHighAccuracy: true
      });
    }

    return () => {
      if (ws) {
        ws.close();
        console.log('WebSocket closed');
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Zoom to leader's location for everyone upon receiving it
  useEffect(() => {
    if (leaderLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [leaderLocation.longitude, leaderLocation.latitude],
        essential: true  // this animation is considered essential with respect to prefers-reduced-motion
      });
      new maplibregl.Marker({ color: 'red' })
        .setLngLat([leaderLocation.longitude, leaderLocation.latitude])
        .addTo(mapRef.current);
    }
  }, [leaderLocation]);

  // Zoom to participant's own location for participant only
useEffect(() => {
    if (participantLocation && mapRef.current && role !== 'leader') {
        mapRef.current.flyTo({
            center: [participantLocation.longitude, participantLocation.latitude],
            essential: true  // this animation is considered essential with respect to prefers-reduced-motion
        });
        const marker = new maplibregl.Marker({ color: 'blue' })
            .setLngLat([participantLocation.longitude, participantLocation.latitude])
            // .setLngLat([-75.304017, 41.618709])
            .addTo(mapRef.current);
        return () => {
            marker.remove();
        };
    }
}, [participantLocation]);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, padding: '10px', background: 'rgba(255,255,255,0.8)' }}>
        {role === 'leader' ? 'Leading the room' : 'Participating in the room'}: {roomCode}
      </div>
    </div>
  );
};

export default MapPage;

// Type for coordinates
interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}
