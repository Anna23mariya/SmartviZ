// frontend/src/services/userService.js
const API_URL = 'http://localhost:5000/api';

export const createUserProfile = async (firebaseUser) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(firebaseUser)
  });
  return response.json();
};

export const updateUserRole = async (firebaseUser) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(firebaseUser)
  });
  return response.json();
};
// Add other API methods similarly