// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://192.168.100.79:5000/api',
// });

// export const setAuthToken = (token) => {
//   if (token) {
//     API.defaults.headers.common['Authorization'] = token;
//   } else {
//     delete API.defaults.headers.common['Authorization'];
//   }
// };

// export default API;
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.100.79:5000/api', // 👈 adjust if needed
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

export default API;
