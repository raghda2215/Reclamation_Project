import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Dimensions
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

export default function ClientScreen() {
  const [clients, setClients] = useState([]);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await axios.get('http://192.168.1.18:8000/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error.message);
      Alert.alert('Erreur', 'Impossible de récupérer la liste des clients');
    } finally {
      setLoading(false);
    }
  };

  const addClient = async () => {
    if (!nom || !email) {
      Alert.alert('Erreur', 'Le nom et l\'email sont obligatoires');
      return;
    }

    const token = await AsyncStorage.getItem('userToken');
    try {
      setLoading(true);
      await axios.post('http://192.168.1.18:8000/api/clients', {
        nom,
        email,
        telephone,
        adresse,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      resetForm();
      setFormVisible(false);
      fetchClients();
      Alert.alert('Succès', 'Client ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le client');
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (id) => {
    if (!nom || !email) {
      Alert.alert('Erreur', 'Le nom et l\'email sont obligatoires');
      return;
    }

    const token = await AsyncStorage.getItem('userToken');
    try {
      setLoading(true);
      await axios.put(`http://192.168.1.18:8000/api/clients/${id}`, {
        nom,
        email,
        telephone,
        adresse,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      resetForm();
      setFormVisible(false);
      fetchClients();
      Alert.alert('Succès', 'Client mis à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le client');
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce client ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('userToken');
            try {
              setLoading(true);
              await axios.delete(`http://192.168.1.18:8000/api/clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchClients();
              Alert.alert('Succès', 'Client supprimé avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le client');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setEditingClient(null);
    setNom('');
    setEmail('');
    setTelephone('');
    setAdresse('');
  };

  const openEditForm = (item) => {
    setEditingClient(item);
    setNom(item.nom);
    setEmail(item.email);
    setTelephone(item.telephone || '');
    setAdresse(item.adresse || '');
    setFormVisible(true);
  };

  const renderClientItem = ({ item }) => (
    <View style={styles.clientItem}>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.nom}</Text>
        <Text style={styles.clientEmail}>{item.email}</Text>
        {item.telephone && <Text style={styles.clientDetail}>Tél: {item.telephone}</Text>}
        {item.adresse && <Text style={styles.clientDetail}>Adresse: {item.adresse}</Text>}
      </View>
      <View style={styles.clientActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditForm(item)}
        >
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteClient(item.id)}
        >
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestion des Clients</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            resetForm();
            setFormVisible(true);
          }}
        >
          <Text style={styles.headerButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des clients occupant tout l'écran */}
      <View style={styles.clientListContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
        ) : clients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun client trouvé</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchClients}
            >
              <Text style={styles.refreshButtonText}>Rafraîchir</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={clients}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderClientItem}
            contentContainerStyle={styles.listContent}
            refreshing={false}
            onRefresh={fetchClients}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal pour ajouter/modifier un client */}
      <Modal
        visible={formVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFormVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingClient ? 'Modifier un client' : 'Ajouter un client'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  resetForm();
                  setFormVisible(false);
                }}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom*</Text>
                <TextInput
                  style={styles.input}
                  value={nom}
                  onChangeText={setNom}
                  placeholder="Nom du client"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email*</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email du client"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Téléphone</Text>
                <TextInput
                  style={styles.input}
                  value={telephone}
                  onChangeText={setTelephone}
                  placeholder="Numéro de téléphone"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adresse</Text>
                <TextInput
                  style={styles.input}
                  value={adresse}
                  onChangeText={setAdresse}
                  placeholder="Adresse du client"
                  multiline
                />
              </View>

              <View style={styles.formButtonContainer}>
                {editingClient ? (
                  <TouchableOpacity 
                    style={[styles.formButton, styles.updateFormButton]} 
                    onPress={() => updateClient(editingClient.id)}
                  >
                    <Text style={styles.formButtonText}>Mettre à jour</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.formButton, styles.addFormButton]} 
                    onPress={addClient}
                  >
                    <Text style={styles.formButtonText}>Ajouter</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  headerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  clientListContainer: {
    flex: 1,
    padding: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  clientItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clientInfo: {
    marginBottom: 10,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  clientEmail: {
    fontSize: 14,
    color: '#0066cc',
    marginBottom: 3,
  },
  clientDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  clientActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 5,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#0066cc',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#0066cc',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  formButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  formButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFormButton: {
    backgroundColor: '#0066cc',
  },
  updateFormButton: {
    backgroundColor: '#28a745',
  },
  formButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
