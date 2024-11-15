import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData, //userData Obj
    {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response) {// Server returned error response
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {// Request made but no response received
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);// Error in request setup
    }
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};
export const addProperty = async (propertyData) => {
  try {
    const response = await axios.post(`${API_URL}/properties`, propertyData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to add property');
  }
};