import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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
        }
      };
  
      fetchOrderDetails();
    }, [id]);
  
    if (!order) return <div>Loading...</div>;
  
    return (
      <div>
        <h2>Order Details</h2>
        <div>
          <h3>Order ID: {order.order_id}</h3>
          <p>Total Cost: ${order.total_cost}</p>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.burrito_name} - Quantity: {item.quantity}
                {item.options && (
                  <ul>
                    {item.options.map((option, optionIndex) => (
                      <li key={optionIndex}>{option}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div>Preparation Status: {order.preparation_status ? 'Prepared' : 'Not Prepared'}</div>
        </div>
      </div>
    );
};
  
export default OrderDetails;
