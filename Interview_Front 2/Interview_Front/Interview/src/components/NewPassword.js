import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './NewPassword.css';

const NewPassword = () => {
  const { uidb64, token } = useParams();
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleNewPassword = async (e) => {
    e.preventDefault();

    if (newPassword1 !== newPassword2) {
      setError('Passwords do not match');
      return;
    }

    const formData = new FormData();
    formData.append('new_password1', newPassword1);
    formData.append('new_password2', newPassword2);

    try {
      const response = await fetch(`http://localhost:8000/auth/password_reset_confirm/${uidb64}/${token}/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('Password has been reset successfully');
        setTimeout(() => navigate('/signin'), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
      console.error('Error during password reset:', error);
    }
  };

  return (
    <div className="new-password-page">
      <div className="header">
        <h2>New Password</h2>
      </div>
      <form className="new-password-form" onSubmit={handleNewPassword}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword1}
          onChange={(e) => setNewPassword1(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={newPassword2}
          onChange={(e) => setNewPassword2(e.target.value)}
        />
        <button type="submit" className="submit-button">Submit</button>
        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default NewPassword;
