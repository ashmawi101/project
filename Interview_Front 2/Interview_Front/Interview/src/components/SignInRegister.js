import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './SignInRegister.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const SignInRegister = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access);
        localStorage.setItem('username', data.username);
        localStorage.setItem('refresh_token', data.refresh);
        console.log("HERE WITH TOKEN:", localStorage.getItem('token'));
        login(data.access, data.refresh ,data.username);  // Call login to update context
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
      console.error('Error during sign-in:', error);
    }
  };

  return (
    <div className="sign-in-register">
      <div className="left-panel">
        <div className="logo">Hireme</div>
      </div>
      <div className="right-panel">
        <h2>Sign In</h2>
        <form className="sign-in-form" onSubmit={handleSignIn}>
          <input
            type="text"
            placeholder="Username/Email Address"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="forgot-password">
            <Link to="/forget-password" >Forgot Password?</Link>
          </div>
          <button type="submit" className="login-button">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignInRegister;
