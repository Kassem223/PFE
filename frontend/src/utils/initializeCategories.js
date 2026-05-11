import axios from 'axios';

export const initializeCategories = async () => {
  try {
    // Call the backend endpoint to initialize the 3 static categories
    const response = await axios.post('http://localhost:3000/api/init-categories');
    console.log('Categories initialized:', response.data);
  } catch (error) {
    // If categories already exist or other error, just log it
    console.log('Categories initialization:', error.response?.data?.message || error.message);
  }
};
