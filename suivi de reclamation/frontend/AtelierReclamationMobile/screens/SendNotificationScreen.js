import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

console.log('Picker:', Picker); // Vérifie si Picker est bien importé

const SendNotificationScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [reclamationId, setReclamationId] = useState('');
  const [users, setUsers] = useState([]);
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Erreur', 'Aucun token d\'authentification trouvé');
        setLoading(false);
        return;
      }
      try {
        const [usersResponse, reclamationsResponse] = await Promise.all([
          axios.get('http://192.168.1.18:8000/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://192.168.1.18:8000/api/reclamations', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        console.log('Utilisateurs récupérés:', usersResponse.data);
        console.log('Réclamations récupérées:', reclamationsResponse.data);
        setUsers(usersResponse.data);
        setReclamations(reclamationsResponse.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error.response ? error.response.data : error.message);
        Alert.alert('Erreur', 'Impossible de récupérer les données. Vérifiez le backend ou le token.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendNotification = async () => {
    if (!message || !userId) {
      Alert.alert('Erreur', 'Veuillez entrer un message et sélectionner un utilisateur');
      return;
    }
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await axios.post(
        'http://192.168.1.18:8000/api/notifications',
        {
          message,
          user_id: userId,
          reclamation_id: reclamationId || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Succès', 'Notification envoyée avec succès');
      setMessage('');
      setUserId('');
      setReclamationId('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification');
      console.error('Erreur lors de l\'envoi:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Envoyer une Notification</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Entrez le message de la notification"
            multiline
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sélectionner un Utilisateur (Responsable Qualité)</Text>
          <Picker
            selectedValue={userId}
            style={styles.picker}
            onValueChange={(itemValue) => setUserId(itemValue)}
          >
            <Picker.Item label="Sélectionner un responsable qualité" value="" />
            {users.length === 0 ? (
              <Picker.Item label="Aucun responsable qualité disponible" value="" />
            ) : (
              users.map((user) => (
                <Picker.Item key={user.id} label={user.name} value={user.id} />
              ))
            )}
          </Picker>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sélectionner une Réclamation (optionnel)</Text>
          <Picker
            selectedValue={reclamationId}
            style={styles.picker}
            onValueChange={(itemValue) => setReclamationId(itemValue)}
          >
            <Picker.Item label="Aucune réclamation" value="" />
            {reclamations.length === 0 ? (
              <Picker.Item label="Aucune réclamation disponible" value="" />
            ) : (
              reclamations.map((reclamation) => (
                <Picker.Item key={reclamation.id} label={reclamation.titre || `Réclamation #${reclamation.titre}`} value={reclamation.id} />
              ))
            )}
          </Picker>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSendNotification} disabled={loading}>
          <Text style={styles.buttonText}>Envoyer la Notification</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 100,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SendNotificationScreen;