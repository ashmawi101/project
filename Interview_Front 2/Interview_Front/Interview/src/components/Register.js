import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import 'react-phone-input-2/lib/style.css';
import './Register.css';
import Swal from 'sweetalert2';
import { AuthContext } from '../AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('DOB', dob);
    formData.append('phone_number', phoneNumber);
    formData.append('country', country);
    formData.append('city', region);
    formData.append('first_name' , first_name)
    formData.append('last_name' , last_name)
    try {
      const response = await axios.post('http://localhost:8000/auth/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      function showCustomAlert() {
        Swal.fire({
            title: 'Registration Successful!',
            text: 'Please add your skills, experiences, and education.',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }
    
    if (response.status == 201) {
        console.log(response.data)
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('refresh_token', response.data.refresh);
        register(response.data.access, response.data.refresh , response.data.username);  // Call login to update context
        showCustomAlert();
        navigate('/profile'); // Redirect to profile page
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <div className="left-panel">
        <div className="logo">Hireme</div>
      </div>
      <div className="right-panel">
        <h2>Register</h2>
        <form className="register-form" onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="First Name"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
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
          <input
            type="date"
            placeholder="Date of Birth"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
          <PhoneInput
            country={'us'}
            value={phoneNumber}
            onChange={phone => setPhoneNumber(phone)}
            placeholder="Phone Number"
            inputStyle={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '5px',
              marginBottom: '1rem'
            }}
          />
          <CountryDropdown
            value={country}
            onChange={(val) => setCountry(val)}
            classes="country-dropdown"
          />
          <RegionDropdown
            country={country}
            value={region}
            onChange={(val) => setRegion(val)}
            classes="region-dropdown"
          />
          <button type="submit" className="submit-button">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
