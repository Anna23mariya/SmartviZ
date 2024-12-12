import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Login.css';
import backgroundImage from '../../assets/background.jpeg';
import { Link } from 'react-router-dom'; // Import Link

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    const adminUsername = "admin@123";
    const adminPassword = "123@admin";

    if (username === adminUsername && password === adminPassword) {
      navigate("/admin-dashboard"); // Redirect to admin dashboard
    } else if (username === "user@123" && password === "123@user") {
      navigate("/user-dashboard"); // Redirect to user dashboard
    } else {
      setErrorMessage("Invalid username or password. Please try again.");
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
    background: 'rgba(30, 40, 50, 0.7)',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0px 4px 20px rgba(33, 15, 15, 0.3)',
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

