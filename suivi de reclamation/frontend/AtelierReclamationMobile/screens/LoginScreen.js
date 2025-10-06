import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import axiosInstance from '../config/axiosConfig';

export default function LoginScreen({ onLogin }) { // Export par défaut
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      console.log('Envoi des données :', { email, password });
      
      // Utiliser axiosInstance au lieu d'axios
      const response = await axiosInstance.post('/users/login', {
        email,
        password,
      });
      
      console.log('Réponse API :', response.data);
      const { token } = response.data;
      const { role } = response.data.user;
      onLogin(token, role);
    } catch (error) {
      console.log('Erreur API :', error.response ? error.response.data : error.message);
      
      let errorMessage = 'Erreur de connexion';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout de connexion. Vérifiez votre réseau.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
    

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Connexion</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez votre email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez votre mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>

    
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  keyboardAvoidingView: { flex: 1, justifyContent: 'center', padding: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#007bff', marginBottom: 5 },
  tagline: { fontSize: 16, color: '#666' },
  formContainer: {
    backgroundColor: 'white', borderRadius: 10, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 5, elevation: 5,
  },
  formTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  inputContainer: { marginBottom: 15 },
  inputLabel: { fontSize: 16, color: '#555', marginBottom: 5, fontWeight: '500' },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#fff' },
  loginButton: { backgroundColor: '#007bff', borderRadius: 8, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loginButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: '#999', fontSize: 14 },
});
