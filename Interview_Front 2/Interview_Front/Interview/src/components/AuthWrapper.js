import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthWrapper = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/signin" />;
  }

  return children;
};

export default AuthWrapper;
