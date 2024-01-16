import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav>
      {/* Only show the "View Orders" link if the path is not the root "/" */}
      {location.pathname !== '/' && <Link to="/orders">View Orders</Link>}
      
      {/* Optionally, you can also conditionally render the "Login" link here */}
      {location.pathname === '/orders' && <Link to="/login">Login</Link>}
    </nav>
  );
};

export default Navbar;
