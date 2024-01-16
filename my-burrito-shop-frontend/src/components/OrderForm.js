import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

const OrderForm = () => {
  const [burritos, setBurritos] = useState([]);
  const [options, setOptions] = useState({});
  const [selectedBurritos, setSelectedBurritos] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
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

    const fetchOptions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/burrito-options`);
        setOptions(response.data.reduce((acc, option) => {
          acc[option.id] = option;
          return acc;
        }, {}));
      } catch (error) {
        console.error("Error fetching options", error);
      }
    };

    fetchBurritos();
    fetchOptions();
  }, []);

  const handleBurritoSelection = (burritoId, quantity) => {
    setSelectedBurritos(prev => ({
      ...prev,
      [burritoId]: quantity
    }));
  };

  const handleOptionToggle = (burritoId, optionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [burritoId]: {
        ...(prev[burritoId] || {}),
        [optionId]: !(prev[burritoId] && prev[burritoId][optionId])
      }
    }));
  };

  const calculateTotalCost = () => {
    let cost = 0;
    for (const burritoId in selectedBurritos) {
      const quantity = selectedBurritos[burritoId];
      const burrito = burritos.find(b => b.id === parseInt(burritoId));
      if (burrito) {
        cost += burrito.price * quantity;

        const burritoOptions = selectedOptions[burritoId];
        if (burritoOptions) {
          for (const optionId in burritoOptions) {
            if (burritoOptions[optionId]) {
              cost += options[optionId].additional_cost * quantity;
            }
          }
        }
      }
    }
    setTotalCost(cost);
  };

  useEffect(calculateTotalCost, [selectedBurritos, selectedOptions, burritos, options]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const items = Object.entries(selectedBurritos).map(([burritoId, quantity]) => ({
      burrito_id: parseInt(burritoId, 10),
      quantity,
      options: selectedOptions[burritoId] ? Object.keys(selectedOptions[burritoId]).filter(optionId => selectedOptions[burritoId][optionId]) : []
    }));

    const orderData = {
      total_cost: totalCost,
      items
    };

    try {
      await axios.post(`${BASE_URL}/api/orders`, orderData);
      alert('Order created successfully!');
      setSelectedBurritos({});
      setSelectedOptions({});
      setTotalCost(0);
    } catch (error) {
      console.error("Error creating order", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <h2>Create Order</h2>
      {burritos.map(burrito => (
        <div key={burrito.id}>
          <div>
            <label htmlFor={`burrito-${burrito.id}`}>{burrito.name} ({burrito.size}): </label>
            <input
              id={`burrito-${burrito.id}`}
              type="number"
              min="0"
              value={selectedBurritos[burrito.id] || ''}
              onChange={e => handleBurritoSelection(burrito.id, parseInt(e.target.value, 10))}
            />
          </div>
          {burrito.options && (
            <div>
            <p>Options:</p>
            {(typeof burrito.options === 'string' ? burrito.options.split(',') : burrito.options).map(optionName => {
                const option = Object.values(options).find(opt => opt.name === optionName.trim());
                if (option) {
                const additionalCost = parseFloat(option.additional_cost); // Ensure it's a number
                return (
                    <label key={option.id}>
                    {option.name} (+${additionalCost.toFixed(2)})
                    <input
                        type="checkbox"
                        onChange={() => handleOptionToggle(burrito.id, option.id)}
                        checked={selectedOptions[burrito.id] && selectedOptions[burrito.id][option.id]}
                    />
                    </label>
                );
                }
                return null;
            })}
            </div>
          )}
        </div>
      ))}
      <div>
        <label htmlFor="total-cost">Total Cost: </label>
        <input
          id="total-cost"
          type="number"
          value={totalCost}
          readOnly
        />
      </div>
      <button type="submit">Submit Order</button>
    </form>
  );
  
};
  

export default OrderForm;
