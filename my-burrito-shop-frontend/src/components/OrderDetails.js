import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import useParams

const BASE_URL = 'http://localhost:3001';

const OrderDetails = () => {
    const [order, setOrder] = useState(null);
    const { id } = useParams();
  
    useEffect(() => {
      const fetchOrderDetails = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/orders/${id}`);
          setOrder(response.data);
        } catch (error) {
          console.error("Error fetching order details", error);
          // Handle error appropriately
        }
      };
  
      fetchOrderDetails();
    }, [id]);
  
    if (!order) return <div>Loading...</div>;
  
    return (
      <div>
        <h2>Order Details</h2>
        <pre>{JSON.stringify(order, null, 2)}</pre>
        {/* Display the preparation status here */}
        <div>Preparation Status: {order.prepared ? 'Prepared' : 'Not Prepared'}</div>
      </div>
    );
  };
  
  export default OrderDetails;