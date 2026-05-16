const axios = require('axios');

const testInquiries = async () => {
  try {
    // We can't easily test protected routes without a token
    // But we can check if the server is up
    const res = await axios.get('http://localhost:5002/api/health');
    console.log('Server is UP. Health:', res.data);
  } catch (err) {
    console.error('Server might be DOWN or erroring:', err.message);
    if (err.response) {
      console.error('Response Data:', err.response.data);
    }
  }
};

testInquiries();
