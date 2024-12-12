import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import backgroundImage from "../../assets/background.jpeg"; // Adjust path as per your project structure

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Save user details (mock or API call)
    console.log("User registered:", formData);
    // Redirect to login
    navigate("/login");
  };

  return (
    <div className="signup-body" style={{ backgroundImage: `url(${backgroundImage})` }}>
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
        <div className="welcome-section">
          <h2>Sign Up to SmartviZ!</h2>
          <p>
            Join us to access concise, visualized notes from lectures,
            presentations, and more, tailored to boost your productivity and
            learning experience.
          </p>
        </div>
        <div className="container"
        style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '40px',
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
          }}
        >
          <h2>Create Account</h2>
          <form onSubmit={handleSignup}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button type="submit" className="signup-button">Sign Up</button>
          </form>
          <div className="extra-options">
            <a href="/login">Already have an account? Login</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
