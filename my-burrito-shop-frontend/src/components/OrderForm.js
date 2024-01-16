import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

const OrderForm = () => {
  const [burritos, setBurritos] = useState([]);
  const [selectedBurritos, setSelectedBurritos] = useState({});
  const [totalCost, setTotalCost] = useState(0); 

  useEffect(() => {
    const fetchBurritos = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/burritos`);
        setBurritos(response.data);
      } catch (error) {
        console.error("Error fetching burritos", error);
      }
    };

    fetchBurritos();
  }, []);

  useEffect(() => {
    const calculateTotalCost = () => {
      let cost = 0;
      for (const burritoId in selectedBurritos) {
        const quantity = selectedBurritos[burritoId];
        const burrito = burritos.find(b => b.id === parseInt(burritoId));
        if (burrito) {
          cost += burrito.price * quantity;
        }
      }
      setTotalCost(cost);
    };

    calculateTotalCost();
  }, [selectedBurritos, burritos]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const items = Object.entries(selectedBurritos).map(([burritoId, quantity]) => ({
      burrito_id: parseInt(burritoId, 10),
      quantity
    }));

    const orderData = {
      total_cost: totalCost, 
      items
    };

    try {
      await axios.post(`${BASE_URL}/api/orders`, orderData);
      alert('Order created successfully!');
      setSelectedBurritos({});
      setTotalCost(0);
    } catch (error) {
      console.error("Error creating order", error);
    }
  };

  const handleBurritoSelection = (burritoId, quantity) => {
    setSelectedBurritos(prev => ({
      ...prev,
      [burritoId]: quantity
    }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <h2>Create Order</h2>
      <div>
        <label htmlFor="total-cost">Total Cost: </label>
        <input 
          id="total-cost"
          type="number" 
          value={totalCost} 
          onChange={e => setTotalCost(parseFloat(e.target.value))}
          required 
        />
      </div>
      <div>
        <h3>Select Burritos</h3>
        {burritos.map(burrito => (
          <div key={burrito.id}>
            <label htmlFor={`burrito-${burrito.id}`}>
              {burrito.name} ({burrito.size}): 
            </label>
            <input 
              id={`burrito-${burrito.id}`}
              type="number" 
              min="0"
              value={selectedBurritos[burrito.id] || ''}
              onChange={e => handleBurritoSelection(burrito.id, parseInt(e.target.value, 10))}
            />
          </div>
        ))}
      </div>
      <button type="submit">Submit Order</button>
    </form>
  );
};

export default OrderForm;
