import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:3001/api/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  const markAsPrepared = async (orderId) => {
    try {
      await axios.put(`http://localhost:3001/api/orders/${orderId}/prepared`);
      setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
    } catch (error) {
      console.error('Error marking order as prepared:', error);
    }
  };

  return (
    <div>
      <h1>Orders List</h1>
      {isLoading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p>Error loading orders: {error}</p>
      ) : orders.length > 0 ? (
        orders.map(order => (
          <div key={order.order_id}>
            <h3>Order ID: {order.order_id}</h3>
            <p>Total Cost: ${parseFloat(order.total_cost).toFixed(2)}</p>
            <ul>
              {order.items.map(item => (
                <li key={item.id}>
                  {item.burrito_name} - Quantity: {item.quantity}
                  {item.options && item.options.length > 0 && (
                    <ul>
                      {item.options.map((option, index) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <button onClick={() => markAsPrepared(order.order_id)}>Mark as Prepared</button>
          </div>
        ))
      ) : (
        <p>No orders to display</p>
      )}
    </div>
  );
};

export default OrdersList;
