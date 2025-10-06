import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ClientScreen from './screens/ClientScreen';
import ReclamationScreen from './screens/ReclamationScreen';
import PhotoScreen from './screens/PhotoScreen';
import RapportScreen from './screens/RapportScreen';

import AddPhotoScreen from './screens/AddPhotoScreen';
import * as Notifications from 'expo-notifications';

import AffectationRapportScreen from './screens/AffectationRapportScreen';

import MesRapportsScreen from './screens/MesRapportsScreen';
import RapportDetailScreen from './screens/RapportDetailScreen';
import SendNotificationScreen from './screens/SendNotificationScreen';
import ReclamationDetailScreen from './screens/ReclamationDetailScreen';
const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Vérification de l\'authentification...');
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token trouvé :', token);
      if (token) {
        const role = await AsyncStorage.getItem('userRole');
        console.log('Rôle trouvé :', role);
        if (role) {
          setUserRole(role.toLowerCase());
          setIsAuthenticated(true);
          await registerForPushNotifications(token); // Attendre l'enregistrement
        } else {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userRole');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const registerForPushNotifications = async (userToken) => {
    console.log('Demande de permissions de notification...');
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      console.log('Permissions accordées, récupération du token...');
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const pushToken = tokenData.data;
        console.log('Token de push Expo:', pushToken);
        if (userToken && pushToken) {
          try {
            const response = await axios.post('http://192.168.1.18:8000/api/users/update-push-token', {
              expo_push_token: pushToken,
            }, {
              headers: { Authorization: `Bearer ${userToken}` },
            });
            console.log('Réponse mise à jour token:', response.data);
          } catch (error) {
            console.error('Erreur lors de la mise à jour du token:', error.message, error.response?.status, error.response?.data);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du token Expo:', error.message);
      }
    } else {
      console.log('Permission de notification non accordée:', status);
    }
  };

  const handleLogin = async (token, role) => {
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userRole', role.toLowerCase());
    setUserRole(role.toLowerCase());
    setIsAuthenticated(true);
    await registerForPushNotifications(token); // Attendre l'enregistrement
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    console.log('Déconnexion effectuée, redirection vers Login');
  };
return (
  <NavigationContainer>
    <Stack.Navigator initialRouteName={isAuthenticated && userRole ? 'Home' : 'Login'}>
      {!isAuthenticated || !userRole ? (
        <Stack.Screen name="Login">
          {props => <LoginScreen {...props} onLogin={handleLogin} />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Home">
            {props => <HomeScreen {...props} onLogout={handleLogout} navigation={props.navigation} />}
          </Stack.Screen>
          {userRole === 'administratif' && (
            <>
              <Stack.Screen name="Client" component={ClientScreen} />
              <Stack.Screen name="AffectationRapports" component={AffectationRapportScreen} />
              <Stack.Screen name="Rapport" component={RapportScreen} />
              <Stack.Screen name="ReclamationView" component={ReclamationViewScreen} />
              <Stack.Screen name="Photo" component={PhotoScreen} />
              <Stack.Screen name="SendNotification" component={SendNotificationScreen} />
            </>
          )}
          {userRole === 'commercial' && (
            <Stack.Screen name="Reclamation" component={ReclamationScreen} />
          )}
          {userRole === 'responsable_qualite' && (
            <>
              
          <Stack.Screen name="MesRapports" component={MesRapportsScreen} options={{ title: 'Mes Rapports' }} />
    <Stack.Screen name="RapportDetail" component={RapportDetailScreen} options={{ title: 'Détails du Rapport' }} />
    <Stack.Screen name="ReclamationDetailScreen" component={ReclamationDetailScreen} />
            </>
          )}
          <Stack.Screen 
            name="AddPhoto" 
            component={AddPhotoScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  </NavigationContainer>
);

}

export default App;

