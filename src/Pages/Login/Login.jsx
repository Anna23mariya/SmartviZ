import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Login.css';
import backgroundImage from '../../assets/background.jpeg';
import { Link } from 'react-router-dom'; // Import Link
import { auth } from '../firebase'; // Import Firebase auth instance
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth method

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        // Store email in localStorage upon successful login
        localStorage.setItem('userEmail', email);
        navigate('/dashboard');
      } else {
        setErrorMessage(data.message || 'Login failed'); // ✅ Fix applied here
      }
    } catch (error) {
      setErrorMessage('Error connecting to server'); // ✅ Fix applied here
    }
  };
  

  return (
    <div className='body' style={{ backgroundImage: `url(${backgroundImage})` }} >
    <div className="main-container"
  style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(30, 40, 50, 0.5)',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0px 4px 20px rgba(33, 15, 15, 0.9)',
    maxWidth: '900px',
  }}
>
      <div className="branding">SmartviZ</div>
      <div
    className="welcome-section"
    style={{ flex: 2, textAlign: 'left', paddingRight: '20px' }}
  >
        <h2>Welcome to SmartviZ!</h2>
        <p>
          Access concise, visualized notes from lectures, presentations, and
          more, tailored to boost your productivity and learning experience.
        </p>
      </div>
      <div
    className="container"
    style={{
      flex: 1,
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      padding: '40px',
      boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.5)',
      textAlign: 'center',
    }}
  >
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
            <input
              type="email" // Changed to email input type
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>
              <input type="checkbox" name="remember-me" /> Remember me
            </label>
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        <div className="extra-options">
          <a href="#">Forgot password?</a>
          <a href="/register">Register</a>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
    </div>
    </div>
  );
};

export default LoginPage;
