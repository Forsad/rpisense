import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import HomePage from './components/HomePage';

// Move AuthForm outside the App component
const AuthForm = ({ isLogin, username, password, setUsername, setPassword, handleSubmit, setIsLogin }) => (
  <div className="auth-form">
    <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        required
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">{isLogin ? 'Login' : 'Create Account'}</button>
    </form>
    <button onClick={() => setIsLogin(!isLogin)}>
      {isLogin ? 'Need an account? Sign Up' : 'Already have account? Login'}
    </button>
  </div>
);

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const url = `http://localhost:5000/api/${isLogin ? 'login' : 'signup'}`;
      const res = await axios.post(url, { username, password });
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setIsAuthenticated(true);
      alert(isLogin ? 'Login successful!' : 'Account created!');
      console.log('Storing token:', res.data.token);
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  }, [isLogin, username, password]);

  // Remove test login as we now have proper authentication
  // const handleTestLogin = () => {
  //   setIsAuthenticated(true);
  // };

  // Add logout function
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    console.log('Removing token');
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? 
            <Navigate to="/home" /> : 
            <AuthForm 
              isLogin={isLogin}
              username={username}
              password={password}
              setUsername={setUsername}
              setPassword={setPassword}
              handleSubmit={handleSubmit}
              setIsLogin={setIsLogin}
            />
          } 
        />
        <Route 
          path="/home" 
          element={
            isAuthenticated ? 
            <HomePage onLogout={handleLogout} /> : 
            <Navigate to="/" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App; 