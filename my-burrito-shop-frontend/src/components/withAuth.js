import React from 'react';
import { useNavigate } from 'react-router-dom';

const withAuth = (Component) => {
  return (props) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return null;
    }

    return <Component {...props} />;
  };
};

export default withAuth;
