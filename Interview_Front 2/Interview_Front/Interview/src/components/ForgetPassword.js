import React, { useState } from 'react';
import './ForgetPassword.css';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/auth/password_reset_request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Check your email to submit a new password!');
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'An error occurred. Please try again later.');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
      console.error('Error during password reset request:', error);
    }
  };

  return (
    <div className="forget-password">
      <div className="left-panel">
        <div className="logo">Hireme</div>
      </div>
      <div className="right-panel">
        {submitted ? (
          <div className="confirmation-message">
            <h2>Forget Password</h2>
            <p>{message}</p>
          </div>
        ) : (
          <>
            <h2>Forget Password</h2>
            <form className="forget-password-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Username/Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="submit-button">Submit</button>
              {error && <p className="error">{error}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
