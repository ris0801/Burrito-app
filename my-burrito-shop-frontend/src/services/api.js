import axios from 'axios';

const BASE_URL = 'http://localhost:3001'; // Your backend server URL

export const getBurritos = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/burritos`);
    return response.data;
  } catch (error) {
    console.error("Error fetching burritos", error);
    // Handle error appropriately
    return null;
  }
};

export const createOrder = async (total_cost, items) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/orders`, { total_cost, items });
    return response.data;
  } catch (error) {
    console.error("Error creating order", error);
    // Handle error appropriately
    return null;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}`, error);
    // Handle error appropriately
    return null;
  }
};
