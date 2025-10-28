import React, { useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { auth: { isAuthenticated, username } } = useContext(AuthContext);
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/register';

  useEffect(() => {
    // Perform any actions needed when the location changes
  }, [location]);

  const renderHomePageLinks = () => (
    <>
      <a href="#top">Home</a>
      <a href="#features">Features</a>
      <Link to="/about">About</Link>
    </>
  );

  const renderAuthLinks = () => (
    <>
      {isAuthenticated ? (
        <Link to='/profile' className="username-button">{username}</Link>
      ) : (
        <>
          <Link to="/signin" className="login-button">Login</Link>
          <Link to="/register" className="register-button">Register</Link>
        </>
      )}
    </>
  );

  const renderNavbarLinks = () => (
    <>
      <Link to={isHomePage ? "/" : "/dashboard"}>Home</Link>
      {!isAuthPage && (
        <>
          <Link to="/jobs">Jobs</Link>
          <Link to="/job-search">Search Jobs</Link>
        </>
      )}
      <Link to="/about">About</Link>
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Hireme</Link>
      </div>
      <div className="navbar-links">
        {isHomePage ? renderHomePageLinks() : renderNavbarLinks()}
      </div>
      <div className="navbar-auth">
        {!isAuthPage && renderAuthLinks()}
      </div>
    </nav>
  );
};

export default Navbar;