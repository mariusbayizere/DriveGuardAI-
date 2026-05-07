import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE ? process.env.REACT_APP_API_BASE.replace('/api/v1','') : 'https://driveguard.local';
const USERS_API_URL = `${API_BASE_URL}/api/v1/users`;

class userService {
  // Get all users
  getAllUsers() {
    return axios.get(USERS_API_URL);
  }

  // Get user by ID
  getUserById(userId) {
    return axios.get(`${USERS_API_URL}/${userId}`);
  }

  // Create new user
  createUser(user) {
    return axios.post(USERS_API_URL, user);
  }

  // Update user
  updateUser(userId, user) {
    return axios.put(`${USERS_API_URL}/${userId}`, user);
  }

  // Delete user
  deleteUser(userId) {
    return axios.delete(`${USERS_API_URL}/${userId}`);
  }
}

export default new userService();
