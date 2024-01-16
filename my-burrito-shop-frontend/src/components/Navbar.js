import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav>
      {location.pathname !== '/' && <Link to="/orders">View Orders</Link>}
      
      {location.pathname === '/orders' && <Link to="/login">Login</Link>}
    </nav>
  );
};

export default Navbar;
