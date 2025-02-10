const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Temporary in-memory storage (replace with database in production)
let users = [];
let devices = []; // Now contains coughTimestamps instead of coughCount

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Signup Endpoint
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  
  if(users.some(user => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  users.push({ username, password });
  
  // Create token after successful signup
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.status(201).json({ message: 'User created successfully', token });
});

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);
  
  if (!user) {
    return res.status(401).json({ message: 'Username not found' });
  }
  
  if (user.password !== password) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  // Create token after successful login
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  
  // Send token in response
  res.json({ 
    message: 'Login successful',
    token,
    user: { username } 
  });
});

// Add device endpoint (after login route)
app.post('/api/devices', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const location = req.body.location?.trim();
    
    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const newDevice = {
      id: devices.length + 1,
      location: location,
      owner: decoded.username,
      status: 'online',
      coughTimestamps: [],
      lastUpdated: new Date()
    };
    
    devices.push(newDevice);
    console.log('Creating device:', newDevice);
    res.status(201).json(newDevice);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Add devices get endpoint
app.get('/api/devices', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const userDevices = devices.filter(device => device.owner === decoded.username)
      .map(device => ({
        ...device,
        coughCount: device.coughTimestamps.filter(ts => Date.now() - ts < 3600000).length,
        coughTimestamps: undefined // Remove from response
      }));
    
    res.json(userDevices);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Add endpoint to handle cough events
app.post('/api/devices/:id/cough', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const deviceId = parseInt(req.params.id);
    
    const device = devices.find(d => d.id === deviceId && d.owner === decoded.username);
    if (!device) return res.status(404).json({ message: 'Device not found' });

    device.coughTimestamps.push(Date.now());
    device.lastUpdated = new Date();
    res.json({ message: 'Cough recorded' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Add error handling middleware at the end
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Endpoint not found' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log('Server starting...');

