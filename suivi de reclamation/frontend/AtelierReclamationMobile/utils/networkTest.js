import axios from 'axios';

export const testConnection = async () => {
  try {
    console.log('Test de connexion au serveur...');
    const response = await axios.get('http://192.168.1.18:8000/api/health', {
      timeout: 10000,
    });
    console.log('Connexion réussie:', response.status);
    return true;
  } catch (error) {
    console.error('Échec de la connexion:', error.message);
    return false;
  }
};
