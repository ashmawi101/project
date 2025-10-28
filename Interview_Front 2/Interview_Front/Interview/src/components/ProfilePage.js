import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = ({ user, onProfilePictureChange, isEditing, toggleEdit }) => {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (user.profilePicture) {
      setImageSrc(`data:image/png;base64,${user.profilePicture}`);
    }
  }, [user.profilePicture]);

  return (
    <div className="profile-header">
      <div className="profile-picture">
        <img src={imageSrc || "https://via.placeholder.com/150"} alt="Profile" />
        {isEditing && (
          <>
            <div className="change-picture-overlay">
              <div className="change-picture-overlay-text">Change Profile Picture</div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onProfilePictureChange}
              className="profile-picture-input"
            />
          </>
        )}
      </div>
      <div className="profile-info">
        <h1>{user.firstName} {user.lastName}</h1>
        <p>Date of Birth: {user.dateOfBirth}</p>
        <p>Phone Number: {user.phone_number}</p>
        <p>Location: {user.location}</p>
        <p>Current Job Title: {user.currentJobTitle}</p>
        <button className="profile-button" onClick={toggleEdit}>
          {isEditing ? 'Save' : 'Edit Profile'}
        </button>
      </div>
    </div>
  );
};

const ProfileSection = ({ title, children }) => {
  return (
    <div className="profile-section">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    location: '',
    phone_number: '',
    currentJobTitle: '',
    profilePicture: '',
  });
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deletedExperiences, setDeletedExperiences] = useState([]);
  const [deletedSkills, setDeletedSkills] = useState([]);
  const [deletedEducation, setDeletedEducation] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get('http://localhost:8000/api/user/profile/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        const userData = response.data;

        setUser({
          firstName: userData.firstName,
          lastName: userData.lastName,
          dateOfBirth: userData.dateOfBirth,
          phone_number: userData.phone_number,
          location: userData.location,
          currentJobTitle: '', // This will be filled later from the experiences
          profilePicture: userData.profile_picture, // Base64 string
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized access - redirecting to sign-in page");
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('refresh_token');
          navigate('/signin');
        }
      }
    };

    const fetchExperiences = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/job_experience/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        setExperiences(response.data);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      }
    };

    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/skill/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        setSkills(response.data);
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };

    const fetchEducation = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/education/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        setEducation(response.data);
      } catch (error) {
        console.error('Error fetching education:', error);
      }
    };

    fetchUserData();
    fetchExperiences();
    fetchSkills();
    fetchEducation();
  }, [navigate]);

  useEffect(() => {
    if (experiences.length > 0) {
      const currentJobs = experiences
        .filter((experience) => !experience.end_date)
        .map((experience) => experience.job_title);

      setUser((prevUser) => ({
        ...prevUser,
        currentJobTitle: currentJobs.join(', '),
      }));
    }
  }, [experiences]);

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/user/update_profile_picture/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        }
      });
      setUser((prevUser) => ({
        ...prevUser,
        profilePicture: URL.createObjectURL(file),
      }));
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index][field] = value;
    setExperiences(updatedExperiences);
  };

  const handleResponsibilityChange = (expIndex, resIndex, value) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[expIndex].responsibilities[resIndex].responsibility = value;
    setExperiences(updatedExperiences);
  };

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index].skill_name = value;
    setSkills(updatedSkills);
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...education];
    updatedEducation[index][field] = value;
    setEducation(updatedEducation);
  };

  const addExperience = () => {
    setExperiences([...experiences, { job_title: '', company_name: '', start_date: '', end_date: '', description: '', responsibilities: [] }]);
  };

  const removeExperience = (index) => {
    const experience = experiences[index];
    if (experience.id) {
      setDeletedExperiences([...deletedExperiences, experience.id]);
    }
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addResponsibility = (index) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index].responsibilities.push({ responsibility: '' });
    setExperiences(updatedExperiences);
  };

  const removeResponsibility = (expIndex, resIndex) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[expIndex].responsibilities = updatedExperiences[expIndex].responsibilities.filter((_, i) => i !== resIndex);
    setExperiences(updatedExperiences);
  };

  const addSkill = () => {
    setSkills([...skills, { skill_name: '' }]);
  };

  const removeSkill = (index) => {
    const skill = skills[index];
    if (skill.id) {
      setDeletedSkills([...deletedSkills, skill.id]);
    }
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, { institution_name: '', degree: '', start_date: '', end_date: '', description: '' }]);
  };

  const removeEducation = (index) => {
    const edu = education[index];
    if (edu.id) {
      setDeletedEducation([...deletedEducation, edu.id]);
    }
    setEducation(education.filter((_, i) => i !== index));
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No token found");
      }

      // Update experiences
      for (let i = 0; i < experiences.length; i++) {
        const experience = experiences[i];
        const payload = {
          job_title: experience.job_title,
          company_name: experience.company_name,
          start_date: experience.start_date,
          end_date: experience.end_date,
          description: experience.description,
          responsibilities: experience.responsibilities.map(r => ({ responsibility: r.responsibility }))
        };
        if (!experience.id) {
          await axios.post('http://localhost:8000/api/job_experience/', payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
        } else {
          await axios.put(`http://localhost:8000/api/job_experience/${experience.id}/`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
        }
      }

      // Remove experiences
      for (let id of deletedExperiences) {
        await axios.delete(`http://localhost:8000/api/job_experience/${id}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
      }

      // Update skills
      for (let i = 0; i < skills.length; i++) {
        const skill = skills[i];
        const payload = { skill_name: skill.skill_name };
        if (!skill.id) {
          await axios.post('http://localhost:8000/api/skill/', payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
        } else {
          payload.id = skill.id; // Add ID to the payload
          await axios.put(`http://localhost:8000/api/skill/${skill.id}/`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
        }
      }

      // Remove skills
      for (let id of deletedSkills) {
        await axios.delete(`http://localhost:8000/api/skill/${id}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
      }

      // Update education
      for (let i = 0; i < education.length; i++) {
        const edu = education[i];
        const payload = {
          institution_name: edu.institution_name,
          degree: edu.degree,
          start_date: edu.start_date,
          end_date: edu.end_date,
          description: edu.description
        };
        if (!edu.id) {
          await axios.post('http://localhost:8000/api/education/', payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
        } else {
          payload.id = edu.id; // Add ID to the payload
          await axios.put(`http://localhost:8000/api/education/${edu.id}/`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
        }
      }

      // Remove education
      for (let id of deletedEducation) {
        await axios.delete(`http://localhost:8000/api/education/${id}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
      }

      // Clear deleted lists
      setDeletedExperiences([]);
      setDeletedSkills([]);
      setDeletedEducation([]);
      
      // Toggle edit mode
      setIsEditing(!isEditing);

    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      saveProfile();
    } else {
      setIsEditing(!isEditing);
    }
  };

  const handleSignOut = async () => {
    try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refresh_token');
        console.log('Retrieved refresh token:', refreshToken);  // Log the token for debugging

        if (!refreshToken) {
            console.error('No refresh token found in local storage');
            return;
        }

        await axios.post('http://localhost:8000/auth/logout/', { refresh_token: refreshToken }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              }
        });

        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
    } catch (error) {
        console.error('Error signing out:', error);
    }
};
return (
    <div className="profile-page">
      <ProfileHeader user={user} onProfilePictureChange={handleProfilePictureChange} isEditing={isEditing} toggleEdit={toggleEdit} />
      <ProfileSection title="Experiences">
        {experiences.map((experience, index) => (
          <div key={experience.id || index} className="experience-item">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={experience.job_title}
                  onChange={(e) => handleExperienceChange(index, 'job_title', e.target.value)}
                  placeholder="Job Title"
                />
                <input
                  type="text"
                  value={experience.company_name}
                  onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                  placeholder="Company Name"
                />
                <input
                  type="date"
                  value={experience.start_date}
                  onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={experience.end_date}
                  onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                  placeholder="End Date"
                />
                <textarea
                  value={experience.description}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  placeholder="Description"
                />
                <button onClick={() => removeExperience(index)}>Remove</button>
                <h4>Responsibilities</h4>
                {experience.responsibilities.map((responsibility, resIndex) => (
                  <div key={responsibility.id || resIndex}>
                    <input
                      type="text"
                      value={responsibility.responsibility}
                      onChange={(e) => handleResponsibilityChange(index, resIndex, e.target.value)}
                      placeholder="Responsibility"
                    />
                    <button onClick={() => removeResponsibility(index, resIndex)}>Remove</button>
                  </div>
                ))}
                <button onClick={() => addResponsibility(index)}>Add Responsibility</button>
              </>
            ) : (
              <>
                <h3>{experience.job_title}</h3>
                <p>{experience.company_name}</p>
                <p>{experience.start_date} - {experience.end_date || 'Present'}</p>
                <p>{experience.description}</p>
                <ul>
                  {experience.responsibilities.map((responsibility) => (
                    <li key={responsibility.id}>{responsibility.responsibility}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
        {isEditing && <button onClick={addExperience}>Add Experience</button>}
      </ProfileSection>
      <ProfileSection title="Skills">
        {skills.map((skill, index) => (
          <div key={skill.id || index} className="skill-item">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={skill.skill_name}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  placeholder="Skill"
                />
                <button onClick={() => removeSkill(index)}>Remove</button>
              </>
            ) : (
              <p>{skill.skill_name}</p>
            )}
          </div>
        ))}
        {isEditing && <button onClick={addSkill}>Add Skill</button>}
      </ProfileSection>
      <ProfileSection title="Education">
        {education.map((edu, index) => (
          <div key={edu.id || index} className="education-item">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={edu.institution_name}
                  onChange={(e) => handleEducationChange(index, 'institution_name', e.target.value)}
                  placeholder="Institution Name"
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  placeholder="Degree"
                />
                <input
                  type="date"
                  value={edu.start_date}
                  onChange={(e) => handleEducationChange(index, 'start_date', e.target.value)}
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={edu.end_date}
                  onChange={(e) => handleEducationChange(index, 'end_date', e.target.value)}
                  placeholder="End Date"
                />
                <textarea
                  value={edu.description}
                  onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                  placeholder="Description"
                />
                <button onClick={() => removeEducation(index)}>Remove</button>
              </>
            ) : (
              <>
                <h3>{edu.institution_name}</h3>
                <p>{edu.degree}</p>
                <p>{edu.start_date} - {edu.end_date}</p>
                <p>{edu.description}</p>
              </>
            )}
          </div>
        ))}
        {isEditing && <button onClick={addEducation}>Add Education</button>}
      </ProfileSection>
      {!isEditing && (
        <button className="sign-out-button" onClick={handleSignOut}>Sign Out</button>
      )}
    </div>
  );
};

export default ProfilePage;