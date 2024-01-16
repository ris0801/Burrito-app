import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BurritoList from './components/BurritoList';
import OrderForm from './components/OrderForm';
import OrderDetails from './components/OrderDetails';
import OrdersList from './components/OrdersList';
import Login from './components/Login'; // Import the Login component
import withAuth from './components/withAuth'; // Import the HOC
 
function App() {
  const AuthOrdersList = withAuth(OrdersList); // Wrap OrdersList component

  return (
    <Router>
      <Routes>
        <Route path="/" element={<BurritoList />} />
        <Route path="/create-order" element={<OrderForm />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/orders" element={<AuthOrdersList />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
