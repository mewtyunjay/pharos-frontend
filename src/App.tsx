import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const getCurrentLocation = async (): Promise<GeolocationCoordinates> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
          } else {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve(position.coords);
              },
              (error) => {
                reject(error);
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
          }
        });
      };

  const handleCreateRoom = async () => {
    try {
      const coords = await getCurrentLocation();
      const initRes = await fetch('http://127.0.0.1:8080/init', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const init = await initRes.json();
      const createRes = await fetch('http://127.0.0.1:8080/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: init.id, 
          coords: { 
            latitude: coords.latitude, 
            longitude: coords.longitude },
          timestamp: new Date().toISOString() 
        })
      });
      const create = await createRes.json();
      const joinTokenRes = await fetch('http://127.0.0.1:8080/joinToken', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: init.id, code: create.code }) });
      const joinToken = await joinTokenRes.json();
      navigate('/map/leader', { state: { role: 'leader', roomCode: create.code, token: joinToken.token } });
    } catch (error) {
      setMessage('Failed to create room or connect.');
    }
  };

  const handleJoinRoom = async () => {
    try {
      const joinTokenRes = await fetch('http://127.0.0.1:8080/joinToken', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: '2b98016d-393e-4d38-b319-a9ca59f87476', code: roomCode }) });
      if (!joinTokenRes.ok) throw new Error('Room code invalid or not found');
      const joinToken = await joinTokenRes.json();
      navigate('/map/participant', { state: { role: 'participant', roomCode, token: joinToken.token } });
    } catch (error) {
      setMessage((error as Error).message || 'Failed to join room.');
    }
  };

  return (
    <div className="App">
      <button onClick={handleCreateRoom}>Create Room</button>
      <input type="text" placeholder="Enter Room Code" value={roomCode} onChange={e => setRoomCode(e.target.value)} />
      <button onClick={handleJoinRoom} disabled={!roomCode} style={{ opacity: roomCode ? 1 : 0.5 }}>Join Room</button>
      <div>{message}</div>
    </div>
  );
}

export default App;
