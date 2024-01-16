import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null); // Reset error state
      try {
        const response = await axios.get('http://localhost:3001/api/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message); // Save the error message
        // You can also set an error state here to show an error message
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, []);


  const markAsPrepared = async (orderId) => {
    try {
      await axios.put(`http://localhost:3001/api/orders/${orderId}/prepared`);
      // Option 1: Remove the order from the list
      setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
  
      // Option 2: Update the status in the UI (requires a slight change in your data model)
    } catch (error) {
      console.error('Error marking order as prepared:', error);
      // Handle error appropriately
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
        <p>Total Cost: ${order.total_cost}</p>
        <ul>
        {order.items && Array.isArray(order.items) ? (
            order.items.map(item => (
            <li key={item.burrito_id}>
                {item.burrito_name} - Quantity: {item.quantity}
            </li>
            ))
        ) : (
            <p>No items in this order</p>
        )}
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
