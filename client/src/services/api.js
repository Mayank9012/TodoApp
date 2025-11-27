import axios from 'axios';

const isDevelopment = process.env.NODE_ENV === 'development';
const API_URL = isDevelopment 
  ? 'http://localhost:5000/api' 
  : '/.netlify/functions/api';

export const getTasks = async (searchQuery = '') => {
  const searchParam = searchQuery ? `?search=${searchQuery}` : '';
  const response = await axios.get(`${API_URL}/tasks${searchParam}`);
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await axios.get(`${API_URL}/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axios.post(`${API_URL}/tasks`, taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await axios.put(`${API_URL}/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axios.delete(`${API_URL}/tasks/${id}`);
  return response.data;
};
