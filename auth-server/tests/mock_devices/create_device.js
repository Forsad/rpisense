const inquirer = require('inquirer');
const axios = require('axios');
require('dotenv').config();

async function createDevice() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Enter your username:'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter your password:'
      },
      {
        type: 'input',
        name: 'location',
        message: 'Enter device location:'
      }
    ]);

    const { username, password, location } = answers;

    // First login to get token
    const loginRes = await axios.post('http://localhost:5000/api/login', {
      username,
      password
    });

    const token = loginRes.data.token;

    // Create device with authentication
    const deviceRes = await axios.post('http://localhost:5000/api/devices', {
      location
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(`✅ Device created at ${location}`);
    console.log(`Device ID: ${deviceRes.data.id}`);
    
  } catch (err) {
    console.error('❌ Error:', err.response?.data?.message || err.message);
  }
}

createDevice(); 