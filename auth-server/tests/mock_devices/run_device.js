const axios = require('axios');
const inquirer = require('inquirer');
require('dotenv').config();

async function runDevice() {
  try {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'username', message: 'Username:' },
      { type: 'password', name: 'password', message: 'Password:' },
      { type: 'input', name: 'deviceId', message: 'Device ID:' },
      { type: 'number', name: 'probability', message: 'Cough probability (0-100):', validate: input => input >= 0 && input <= 100 }
    ]);

    // Login
    const loginRes = await axios.post('http://localhost:5000/api/login', {
      username: answers.username,
      password: answers.password
    });
    
    const token = loginRes.data.token;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    console.log(`🚀 Device ${answers.deviceId} running...`);
    
    // Run indefinitely
    setInterval(async () => {
      if (Math.random() * 100 < answers.probability) {
        try {
          await axios.post(
            `http://localhost:5000/api/devices/${answers.deviceId}/cough`,
            {},
            config
          );
          console.log('🤖 Cough detected!');
        } catch (err) {
          console.error('❌ Cough send failed:', err.response?.data?.message);
        }
      }
    }, 1000); // Check every second

  } catch (err) {
    console.error('❌ Error:', err.response?.data?.message || err.message);
    process.exit(1);
  }
}

runDevice(); 