import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  Dimensions,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

export default function RapportScreen() {
  const [rapports, setRapports] = useState([]);
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [reclamationId, setReclamationId] = useState('');
  const [reclamations, setReclamations] = useState([]);
  const [editingRapport, setEditingRapport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchRapports(), fetchReclamations()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchRapports = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await axios.get('http://192.168.1.18:8000/api/rapports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRapports(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports:', error.message);
      Alert.alert('Erreur', 'Impossible de récupérer les rapports');
    }
  };

  const fetchReclamations = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await axios.get('http://192.168.1.18:8000/api/reclamations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReclamations(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des réclamations:', error.message);
      Alert.alert('Erreur', 'Impossible de récupérer les réclamations');
    }
  };

  const addRapport = async () => {
    if (!titre || !contenu || !reclamationId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const token = await AsyncStorage.getItem('userToken');
    try {
      setLoading(true);
      await axios.post('http://192.168.1.18:8000/api/rapports', {
        titre,
        contenu,
        reclamation_id: reclamationId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      resetForm();
      setFormVisible(false);
      fetchRapports();
      Alert.alert('Succès', 'Rapport ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le rapport');
    } finally {
      setLoading(false);
    }
  };

  const updateRapport = async (id) => {
    if (!titre || !contenu || !reclamationId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const token = await AsyncStorage.getItem('userToken');
    try {
      setLoading(true);
      await axios.put(`http://192.168.1.18:8000/api/rapports/${id}`, {
        titre,
        contenu,
        reclamation_id: reclamationId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      resetForm();
      setFormVisible(false);
      fetchRapports();
      Alert.alert('Succès', 'Rapport mis à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le rapport');
    } finally {
      setLoading(false);
    }
  };

  const deleteRapport = async (id) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce rapport ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('userToken');
            try {
              setLoading(true);
              await axios.delete(`http://192.168.1.18:8000/api/rapports/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchRapports();
              Alert.alert('Succès', 'Rapport supprimé avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le rapport');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setEditingRapport(null);
    setTitre('');
    setContenu('');
    setReclamationId('');
  };

  const getReclamationTitle = (id) => {
    const reclamation = reclamations.find(r => r.id === parseInt(id));
    return reclamation ? reclamation.titre : 'Non spécifiée';
  };

  const renderRapportItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.titre}</Text>
      </View>
      
      <Text style={styles.reclamationInfo}>
        Réclamation: {item.reclamation?.titre || 'Non spécifiée'}
      </Text>
      
      <Text style={styles.contentPreview} numberOfLines={2}>
        {item.contenu}
      </Text>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            setEditingRapport(item);
            setTitre(item.titre);
            setContenu(item.contenu);
            setReclamationId(item.reclamation_id?.toString() || '');
            setFormVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteRapport(item.id)}
        >
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rapports</Text>
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

      <View style={styles.listContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#2c3e50" style={styles.loader} />
        ) : rapports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun rapport trouvé</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchRapports}
            >
              <Text style={styles.refreshButtonText}>Rafraîchir</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={rapports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRapportItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2c3e50']}
                tintColor="#2c3e50"
              />
            }
          />
        )}
      </View>

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
                {editingRapport ? 'Modifier le rapport' : 'Nouveau rapport'}
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
                <Text style={styles.inputLabel}>Titre*</Text>
                <TextInput
                  style={styles.input}
                  value={titre}
                  onChangeText={setTitre}
                  placeholder="Titre du rapport"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contenu*</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={contenu}
                  onChangeText={setContenu}
                  placeholder="Contenu détaillé du rapport"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Réclamation associée*</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={reclamationId}
                    style={styles.picker}
                    onValueChange={(itemValue) => setReclamationId(itemValue)}
                  >
                    <Picker.Item label="Sélectionner une réclamation" value="" />
                    {reclamations.map((reclamation) => (
                      <Picker.Item 
                        key={reclamation.id} 
                        label={reclamation.titre} 
                        value={reclamation.id.toString()} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formButtonContainer}>
                {editingRapport ? (
                  <>
                    <TouchableOpacity 
                      style={[styles.formButton, styles.updateFormButton]} 
                      onPress={() => updateRapport(editingRapport.id)}
                    >
                      <Text style={styles.formButtonText}>Mettre à jour</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.formButton, styles.cancelFormButton]} 
                      onPress={() => {
                        resetForm();
                        setFormVisible(false);
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity 
                    style={[styles.formButton, styles.addFormButton]} 
                    onPress={addRapport}
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
    backgroundColor: '#2c3e50',
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
  listContainer: {
    flex: 1,
    padding: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  reclamationInfo: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
    marginBottom: 8,
  },
  contentPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
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
    backgroundColor: '#2c3e50',
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
    backgroundColor: '#2c3e50',
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
  textArea: {
    minHeight: 120,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  formButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  formButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  addFormButton: {
    backgroundColor: '#2c3e50',
  },
  updateFormButton: {
    backgroundColor: '#27ae60',
    marginRight: 10,
  },
  cancelFormButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  formButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
