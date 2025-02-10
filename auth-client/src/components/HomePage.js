import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CoughChart from './CoughChart';
import axios from 'axios';

function HomePage({ onLogout }) {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [devices, setDevices] = useState([]);
  const [newDevice, setNewDevice] = useState({ location: '' });

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/devices');
        setDevices(res.data);
      } catch (err) {
        console.error('Error fetching devices:', err);
      }
    };
    
    // Initial fetch
    fetchDevices();
    
    // Set up interval to refresh every 2 seconds
    const interval = setInterval(fetchDevices, 2000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
    navigate('/');
  };

  const addDevice = async (e) => {
    e.preventDefault();
    if (newDevice.location.trim()) {
      try {
        const res = await axios.post('http://localhost:5000/api/devices', {
          location: newDevice.location
        });
        setDevices([...devices, res.data]);
        setNewDevice({ location: '' });
      } catch (err) {
        alert('Error adding device: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeviceClick = (location) => {
    setSelectedLocation(location);
  };

  const refreshDevices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/devices');
      setDevices(res.data);
    } catch (err) {
      console.error('Error refreshing devices:', err);
    }
  };

  return (
    <div className="home-page">
      <header className="dashboard-header">
        <h1>Cough Monitoring Devices</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="devices-section">
          <h2>Add New Device</h2>
          <form onSubmit={addDevice} className="add-device-form">
            <input
              type="text"
              value={newDevice.location}
              onChange={(e) => setNewDevice({...newDevice, location: e.target.value})}
              placeholder="Enter Location..."
              className="device-input"
            />
            <button type="submit">Add Device</button>
          </form>

          <div className="device-list">
            {devices.map(device => (
              <div 
                key={device.id} 
                className={`device-item ${device.status.toLowerCase()}`}
                onClick={() => handleDeviceClick(device.location)}
              >
                <div className="device-info">
                  <h3>{device.location}</h3>
                  <p>Status: {device.status}</p>
                  <p>Coughs Detected: {device.coughCount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedLocation && (
        <CoughChart 
          location={selectedLocation} 
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </div>
  );
}

export default HomePage; 