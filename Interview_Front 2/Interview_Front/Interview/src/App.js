import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';
import SignInRegister from './components/SignInRegister';
import ForgetPassword from './components/ForgetPassword';
import NewPassword from './components/NewPassword';
import Dashboard from './components/Dashboard';
import InterviewSimulation from './components/InterviewSimulation';
import JobDescription from './components/JobDescription';
import CompanyHomePage from './components/CompanyHomePage';
import Register from './components/Register';
import ProfileSettings from './components/ProfileSettings';
import JobSearch from './components/JobSearch';
import InterviewSummary from './components/InterviewSummary';
import RecommendedJobs from './components/RecommendedJobs';
import About from './components/About';
import SubmitJob from './components/SubmitJob';
import './App.css';
import Jobs from './components/Jobs';
import ProfilePage from './components/ProfilePage';
import { AuthProvider, useAuth } from './AuthContext';
import SurveyPage from './components/SurveyPage';

const PrivateRoute = ({ children }) => {
  const { auth: { isAuthenticated }, loading } = useAuth();
  console.log("Checking if user is authenticated:", isAuthenticated);
  console.log("Loading state:", loading);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while checking authentication
  }

  return isAuthenticated ? children : <Navigate to="/signin" />;
};

const AppContent = () => {
  const { auth: { isAuthenticated } } = useAuth();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [isAuthenticated]);

  return (
    <div className="App">
      <Navbar isLoggedIn={isAuthenticated} username={username} />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/signin" element={<SignInRegister />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:uidb64/:token" element={<NewPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/interview-simulation" element={<PrivateRoute><InterviewSimulation /></PrivateRoute>} />
        <Route path="/job-description" element={<PrivateRoute><JobDescription /></PrivateRoute>} />
        <Route path="/company-home" element={<PrivateRoute><CompanyHomePage /></PrivateRoute>} />
        <Route path="/profile-settings" element={<PrivateRoute><ProfileSettings /></PrivateRoute>} />
        <Route path="/job-search" element={<PrivateRoute><JobSearch /></PrivateRoute>} />
        <Route path="/interview-summary/:interviewId" element={<PrivateRoute><InterviewSummary /></PrivateRoute>} />
        <Route path="/recommended-jobs" element={<PrivateRoute><RecommendedJobs /></PrivateRoute>} />
        <Route path="/submit-job" element={<PrivateRoute><SubmitJob /></PrivateRoute>} />
        <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
        <Route path="/jobs/:id" element={<PrivateRoute><JobDescription /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/survey/:interviewId" element={<PrivateRoute><SurveyPage /></PrivateRoute>} />
      </Routes>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
