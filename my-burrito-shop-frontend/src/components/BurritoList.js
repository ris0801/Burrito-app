import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBurritos } from '../services/api';

const BurritoList = () => {
  const [burritos, setBurritos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBurritos = async () => {
      const data = await getBurritos();
      setBurritos(data);
    };

    fetchBurritos();
  }, []);

  return (
    <div>
      <h1>Burrito Menu</h1>
      <ul>
        {burritos.map(burrito => (
          <li key={burrito.id}>
            {burrito.name} ({burrito.size}) - ${burrito.price}
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/create-order')}>Place Order</button>
      <button onClick={() => navigate('/login')}>Employee Login</button>
    </div>
  );
};

export default BurritoList;
