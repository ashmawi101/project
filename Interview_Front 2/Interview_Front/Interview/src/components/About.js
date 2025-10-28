import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="header">
        <h2>About Us</h2>
      </div>
      <div className="about-content">
      <p>We are a team of four IT majors from Damascus University, specializing in Artificial Intelligence.</p>
        <p>Our project aims to help users prepare and train for job interviews, apply for suitable positions, and receive job recommendations. Our interview simulation tool assesses users' performance and provides personalized job suggestions based on their skills, experiences, salary expectations, and other preferences.</p>
        <p>Meet Our Team: Ammar Hunaidi, Abd Al Jabbar Al Barazi, Qusai Brro, Mohammad Abu Nokta</p>
        <p>Professor Supervisor: Dr. Nada Ghneim</p>
        <p>Teacher Supervisor: Eng. Khaled Ismael</p>
      </div>
    </div>
  );
};

export default About;
