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
  Dimensions
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RefreshControl } from 'react-native';

const { height } = Dimensions.get('window');

export default function ReclamationScreen() {
  const [reclamations, setReclamations] = useState([]);
  const [formData, setFormData] = useState({
    nonMaitrise: { checked: false, value: '' },
    produitNonAdequat: { checked: false, value: '' },
    emballage: { checked: false, value: '' },
    service: { checked: false, value: '' },
    produit: { checked: false, value: '' }
  });
  const [titre, setTitre] = useState('');
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState([]);
  const [editingReclamation, setEditingReclamation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchReclamations(), fetchClients()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
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

  const fetchClients = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await axios.get('http://192.168.1.18:8000/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error.message);
      Alert.alert('Erreur', 'Impossible de récupérer la liste des clients');
    }
  };

  const addReclamation = async () => {
    if (!titre || !clientId || !Object.values(formData).some(item => item.checked)) {
      Alert.alert('Erreur', 'Veuillez saisir un titre, sélectionner un client et au moins une catégorie');
      return;
    }

    const token = await AsyncStorage.getItem('userToken');
    try {
      setLoading(true);
      const data = {
        titre,
        formData: JSON.stringify(formData),
        client_id: clientId,
      };
      await axios.post('http://192.168.1.18:8000/api/reclamations', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      resetForm();
      setFormVisible(false);
      fetchReclamations();
      Alert.alert('Succès', 'Réclamation ajoutée avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la réclamation');
    } finally {
      setLoading(false);
    }
  };

  const updateReclamation = async (id) => {
    if (!titre || !clientId || !Object.values(formData).some(item => item.checked)) {
      Alert.alert('Erreur', 'Veuillez saisir un titre, sélectionner un client et au moins une catégorie');
      return;
    }

    const token = await AsyncStorage.getItem('userToken');
    try {
      setLoading(true);
      const data = {
        titre,
        formData: JSON.stringify(formData),
        client_id: clientId,
      };
      await axios.put(`http://192.168.1.18:8000/api/reclamations/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      resetForm();
      setFormVisible(false);
      fetchReclamations();
      Alert.alert('Succès', 'Réclamation mise à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la réclamation');
    } finally {
      setLoading(false);
    }
  };

  const deleteReclamation = async (id) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette réclamation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('userToken');
            try {
              setLoading(true);
              await axios.delete(`http://192.168.1.18:8000/api/reclamations/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchReclamations();
              Alert.alert('Succès', 'Réclamation supprimée avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la réclamation');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setEditingReclamation(null);
    setFormData({
      nonMaitrise: { checked: false, value: '' },
      produitNonAdequat: { checked: false, value: '' },
      emballage: { checked: false, value: '' },
      service: { checked: false, value: '' },
      produit: { checked: false, value: '' }
    });
    setTitre('');
    setClientId('');
    setClientDropdownOpen(false);
  };

  const renderReclamationItem = ({ item }) => {
    const parsedFormData = item.formData ? JSON.parse(item.formData) : {};
    const selectedFields = Object.entries(parsedFormData)
      .filter(([_, data]) => data.checked)
      .map(([key, data]) => {
        let label = '';
        switch (key) {
          case 'nonMaitrise': label = 'Non maîtrise de la technique de collage'; break;
          case 'produitNonAdequat': label = 'Produit non adéquat ou support'; break;
          case 'emballage': label = 'Emballage'; break;
          case 'service': label = 'Service'; break;
          case 'produit': label = 'Produit'; break;
          default: label = key;
        }
        return `${label}${data.value ? ` : ${data.value}` : ''}`;
      });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.titre}</Text>
        </View>
        <Text style={styles.clientName}>
          Client : {item.client?.nom || 'Non spécifié'}
        </Text>

        {selectedFields.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.detailsTitle}>Détails :</Text>
            {selectedFields.map((line, index) => (
              <Text key={index} style={styles.detailsText}>• {line}</Text>
            ))}
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              setEditingReclamation(item);
              setFormData(item.formData ? JSON.parse(item.formData) : formData);
              setTitre(item.titre || '');
              setClientId(item.client_id);
              setFormVisible(true);
            }}
          >
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteReclamation(item.id)}
          >
            <Text style={styles.buttonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réclamations</Text>
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
          <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
        ) : reclamations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune réclamation trouvée</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchReclamations}
            >
              <Text style={styles.refreshButtonText}>Rafraîchir</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={reclamations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReclamationItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0066cc']}
                tintColor="#0066cc"
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
                {editingReclamation ? 'Modifier la réclamation' : 'Nouvelle réclamation'}
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

              {/* Champ Titre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre*</Text>
                <TextInput
                  style={styles.formInput}
                  value={titre}
                  onChangeText={setTitre}
                  placeholder="Entrer un titre"
                />
              </View>

              {/* Client */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Client*</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setClientDropdownOpen(!clientDropdownOpen)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {clientId ?
                      clients.find(c => c.id === clientId)?.nom || 'Client sélectionné' :
                      'Sélectionner un client'
                    }
                  </Text>
                  <Text style={styles.dropdownArrow}>
                    {clientDropdownOpen ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
                {clientDropdownOpen && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        !clientId && styles.dropdownItemSelected
                      ]}
                      onPress={() => {
                        setClientId('');
                        setClientDropdownOpen(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        !clientId && styles.dropdownItemTextSelected
                      ]}>
                        Sélectionner un client
                      </Text>
                      {!clientId && <Text style={styles.checkMark}>✓</Text>}
                    </TouchableOpacity>
                    {clients.map((client) => (
                      <TouchableOpacity
                        key={client.id}
                        style={[
                          styles.dropdownItem,
                          clientId === client.id && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setClientId(client.id);
                          setClientDropdownOpen(false);
                        }}
                      >
                        <View style={styles.clientInfo}>
                          <Text style={[
                            styles.clientName,
                            clientId === client.id && styles.dropdownItemTextSelected
                          ]}>
                            {client.nom}
                          </Text>
                          <Text style={[
                            styles.clientEmail,
                            clientId === client.id && styles.clientEmailSelected
                          ]}>
                            {client.email}
                          </Text>
                        </View>
                        {clientId === client.id && (
                          <Text style={styles.checkMark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Non Maitrise */}
              <View style={styles.formRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      nonMaitrise: { ...formData.nonMaitrise, checked: !formData.nonMaitrise.checked },
                    })
                  }
                >
                  {formData.nonMaitrise.checked && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
                <Text style={styles.formLabel}>Non Maîtrise de la technique de collage</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.nonMaitrise.value}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nonMaitrise: { ...formData.nonMaitrise, value: text } })
                  }
                  editable={formData.nonMaitrise.checked}
                  placeholder=""
                />
              </View>

              {/* Produit Non Adéquat */}
              <View style={styles.formRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      produitNonAdequat: { ...formData.produitNonAdequat, checked: !formData.produitNonAdequat.checked },
                    })
                  }
                >
                  {formData.produitNonAdequat.checked && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
                <Text style={styles.formLabel}>Produit non adéquat ou support</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.produitNonAdequat.value}
                  onChangeText={(text) =>
                    setFormData({ ...formData, produitNonAdequat: { ...formData.produitNonAdequat, value: text } })
                  }
                  editable={formData.produitNonAdequat.checked}
                  placeholder=""
                />
              </View>

              {/* Emballage (TextInput) */}
              <View style={styles.formRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      emballage: { ...formData.emballage, checked: !formData.emballage.checked },
                    })
                  }
                >
                  {formData.emballage.checked && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
                <Text style={styles.formLabel}>Emballage</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.emballage.value}
                  onChangeText={(text) =>
                    setFormData({ ...formData, emballage: { ...formData.emballage, value: text } })
                  }
                  editable={formData.emballage.checked}
                  placeholder=""
                />
              </View>

              {/* Service (TextInput) */}
              <View style={styles.formRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      service: { ...formData.service, checked: !formData.service.checked },
                    })
                  }
                >
                  {formData.service.checked && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
                <Text style={styles.formLabel}>Service</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.service.value}
                  onChangeText={(text) =>
                    setFormData({ ...formData, service: { ...formData.service, value: text } })
                  }
                  editable={formData.service.checked}
                  placeholder=""
                />
              </View>

              {/* Produit */}
              <View style={styles.formRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      produit: { ...formData.produit, checked: !formData.produit.checked },
                    })
                  }
                >
                  {formData.produit.checked && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
                <Text style={styles.formLabel}>Produit</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.produit.value}
                  onChangeText={(text) =>
                    setFormData({ ...formData, produit: { ...formData.produit, value: text } })
                  }
                  editable={formData.produit.checked}
                  placeholder=""
                />
              </View>

              <View style={styles.formButtonContainer}>
                {editingReclamation ? (
                  <>
                    <TouchableOpacity
                      style={[styles.formButton, styles.updateFormButton]}
                      onPress={() => updateReclamation(editingReclamation.id)}
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
                    onPress={addReclamation}
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
  listContainer: {
    flex: 1,
    padding: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  clientName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
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
    fontSize: 14,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  checkMark: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    minHeight: 50,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: 'white',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#0066cc',
    fontWeight: '600',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  clientEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  clientEmailSelected: {
    color: '#0066cc',
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
    backgroundColor: '#0066cc',
  },
  updateFormButton: {
    backgroundColor: '#28a745',
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
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#333',
  },
  formRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},
formLabel: {
  flex: 1,
  backgroundColor: '#e5e5e5',
  paddingVertical: 10,
  paddingHorizontal: 8,
  borderRadius: 4,
  fontSize: 14,
  color: '#333',
  marginHorizontal: 5,
},
formInput: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#999',
  borderRadius: 6,
  marginLeft: 5,
  paddingHorizontal: 8,
  height: 40,
  justifyContent: 'center',
  backgroundColor: '#fff',
},
checkbox: {
  width: 20,
  height: 20,
  borderWidth: 1,
  borderColor: '#666',
  marginRight: 5,
  justifyContent: 'center',
  alignItems: 'center',
},
checkMark: {
  fontSize: 14,
  color: 'black',
},
 detailsTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000'
  },
  detailsText: {
    color: '#555',
    marginLeft: 4
  }
});