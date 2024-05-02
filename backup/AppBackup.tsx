import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import './App.css';

function App() {
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate(); // Hook for navigation

  const handleCreateRoom = async () => {
    try {
      // Initialize and get UUID
      const initRes = await fetch('http://127.0.0.1:8080/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      const init = await initRes.json();
      console.log('Received ID:', init.id);

      // use UUID and latlong to get room code
      const createRes = await fetch('http://127.0.0.1:8080/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: init.id,
          coords: { latitude: 172, longitude: 111 },
          timestamp: new Date().toISOString(),
        })
      });
      const create = await createRes.json();
      console.log('Received Code:', create.code);

      // get joinCode with roomcode 
      const joinTokenRes = await fetch('http://127.0.0.1:8080/joinToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: init.id,
          code: create.code
        })
      });
      const joinToken = await joinTokenRes.json();
      console.log('Received Token and Expiry:', joinToken);

      // Establish WebSocket connection
      const ws = new WebSocket(`ws://127.0.0.1:8080/join?token=${joinToken.token}`);

      ws.onopen = () => {
        console.log('WebSocket connected', ws);
        setMessage('Connected to WebSocket. Redirecting to map...');

        setTimeout(() => {
          navigate('/map'); // Redirect to the map page after 1 second
        }, 1500); 
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setMessage('Failed to connect WebSocket');
      };
      

    } catch (error) {
      console.error('Error in API or WebSocket connection:', error);
      setMessage('Failed to create room or connect.');
    }
    
  };

  return (
    <div className="App">
      <button onClick={handleCreateRoom}>Create Room</button>
      <div>{message}</div>
    </div>
  );
}

export default App;
