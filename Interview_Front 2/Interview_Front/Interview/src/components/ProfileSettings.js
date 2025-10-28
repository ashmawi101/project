import React, { useState } from 'react';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    dateOfBirth: '',
    // add other fields as necessary
  });

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle profile update logic
  };

  return (
    <div className="profile-settings-page">
      <div className="header">
        <h2>Profile Settings</h2>
      </div>
      <form className="profile-settings-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={profileData.username}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={profileData.email}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dateOfBirth"
          placeholder="Date of Birth"
          value={profileData.dateOfBirth}
          onChange={handleChange}
        />
        {/* Add more fields as necessary */}
        <button type="submit" className="submit-button">Save</button>
      </form>
    </div>
  );
};

export default ProfileSettings;
