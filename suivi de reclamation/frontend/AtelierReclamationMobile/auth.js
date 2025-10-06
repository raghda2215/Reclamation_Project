import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(email, password) {
    const response = await fetch('http://192.168.1.18:8000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      timeout: 30000, // 30 secondes
    });
    const data = await response.json();
    if (data.token) {
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userRole', data.role);
    }
    return data;
  },

  async logout() {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
  },

  async getToken() {
    return await AsyncStorage.getItem('userToken');
  },
};
