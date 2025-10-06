import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const RapportDetailScreen = ({ route, navigation }) => {
  const { rapport } = route.params;
  const [selectedParts, setSelectedParts] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [remplacementChecked, setRemplacementChecked] = useState(false);
  const [remplacementText, setRemplacementText] = useState('');
  const [sensibilisationChecked, setSensibilisationChecked] = useState(false);
  const [sensibilisationText, setSensibilisationText] = useState('');
  const [assistanceChecked, setAssistanceChecked] = useState(false);
  const [assistanceText, setAssistanceText] = useState('');
  const [autresChecked, setAutresChecked] = useState(false);
  const [autresText, setAutresText] = useState('');

  const togglePartSelection = (partId) => {
    setSelectedParts((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const handleValidation = async () => {
    if (!rapport.reclamation || !selectedParts.includes(rapport.reclamation.id)) {
      Alert.alert('Erreur', 'Veuillez sélectionner la réclamation à valider');
      return;
    }
    if (!selectedDate) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date d\'examen');
      return;
    }

    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      navigation.navigate('Login');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        parts: [rapport.reclamation.id], // فقط ID de la réclamation
        date_examen: selectedDate.toISOString(),
        remplacement: remplacementChecked ? remplacementText : '',
        sensibilisation: sensibilisationChecked ? sensibilisationText : '',
        assistance: assistanceChecked ? assistanceText : '',
        autres: autresChecked ? autresText : '',
      };

      console.log('Envoi de la requête à:', `http://192.168.1.18:8000/api/rapports/${rapport.id}/valider-reclamations`);
      console.log('Payload:', payload);

      await axios.post(
        `http://192.168.1.18:8000/api/rapports/${rapport.id}/valider-reclamations`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Succès', 'Réclamation validée avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const message = error.response?.data?.message || 'Impossible de valider la réclamation. Vérifiez votre connexion ou les données envoyées.';
      Alert.alert('Erreur', message);
      console.log('Erreur complète:', error.response?.data, error.response?.status);
    } finally {
      setLoading(false);
    }
  };

const viewReclamation = async () => {
  if (!rapport.reclamation) {
    Alert.alert('Erreur', 'Aucune réclamation associée à ce rapport');
    return;
  }

  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await axios.get(
      `http://192.168.1.18:8000/api/reclamations/${rapport.reclamation.id}/details`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    navigation.navigate('ReclamationDetailScreen', { reclamation: response.data });
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de récupérer la réclamation complète');
    console.log(error.response?.data || error.message);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Détails du Rapport</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{rapport.titre}</Text>
          <Text style={styles.cardText}>{rapport.contenu}</Text>
          {rapport.reclamation && (
            <Text style={styles.cardText}>
              Réclamation: {rapport.reclamation.titre || 'Aucune réclamation associée'}
            </Text>
          )}
          <Text style={styles.cardText}>
            Date d'affectation:{' '}
            {rapport.responsables?.[0]?.pivot?.date_affectation
              ? new Date(rapport.responsables[0].pivot.date_affectation).toLocaleDateString()
              : 'Non spécifiée'}
          </Text>
          {rapport.reclamation && (
            <TouchableOpacity style={styles.viewReclamationButton} onPress={viewReclamation}>
              <Text style={styles.viewReclamationText}>Voir la Réclamation</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Réclamation à Valider</Text>
        <View style={styles.selectionContainer}>
          {rapport.reclamation ? (
            <>
              <TouchableOpacity
                style={styles.selectionItem}
                onPress={() => togglePartSelection(rapport.reclamation.id)}
              >
                <Icon
                  name={selectedParts.includes(rapport.reclamation.id) ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={selectedParts.includes(rapport.reclamation.id) ? '#27ae60' : '#bdc3c7'}
                />
                <Text style={styles.selectionText}>
                  {rapport.reclamation.titre || 'Réclamation sans titre'}
                </Text>
              </TouchableOpacity>

              <View style={styles.formContainer}>
                {/** Demande Remplacement */}
                <View style={styles.formRow}>
                  <TouchableOpacity
                    style={styles.formLabel}
                    onPress={() => setRemplacementChecked(!remplacementChecked)}
                  >
                    <Icon
                      name={remplacementChecked ? 'check-box' : 'check-box-outline-blank'}
                      size={20}
                      color={remplacementChecked ? '#27ae60' : '#bdc3c7'}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.formLabelText}>Demande Remplacement de produit</Text>
                  </TouchableOpacity>
                  {remplacementChecked && (
                    <TextInput
                      style={styles.formInput}
                      value={remplacementText}
                      onChangeText={setRemplacementText}
                      placeholder="Détails du remplacement"
                    />
                  )}
                </View>

                {/** Sensibilisation */}
                <View style={styles.formRow}>
                  <TouchableOpacity
                    style={styles.formLabel}
                    onPress={() => setSensibilisationChecked(!sensibilisationChecked)}
                  >
                    <Icon
                      name={sensibilisationChecked ? 'check-box' : 'check-box-outline-blank'}
                      size={20}
                      color={sensibilisationChecked ? '#27ae60' : '#bdc3c7'}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.formLabelText}>Sensibilisation du client</Text>
                  </TouchableOpacity>
                  {sensibilisationChecked && (
                    <TextInput
                      style={[styles.formInput, { height: 60 }]}
                      value={sensibilisationText}
                      onChangeText={setSensibilisationText}
                      placeholder="Détails de la sensibilisation"
                      multiline
                    />
                  )}
                </View>

                {/** Assistance */}
                <View style={styles.formRow}>
                  <TouchableOpacity
                    style={styles.formLabel}
                    onPress={() => setAssistanceChecked(!assistanceChecked)}
                  >
                    <Icon
                      name={assistanceChecked ? 'check-box' : 'check-box-outline-blank'}
                      size={20}
                      color={assistanceChecked ? '#27ae60' : '#bdc3c7'}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.formLabelText}>Assistance Technique</Text>
                  </TouchableOpacity>
                  {assistanceChecked && (
                    <TextInput
                      style={[styles.formInput, { height: 60 }]}
                      value={assistanceText}
                      onChangeText={setAssistanceText}
                      placeholder="Détails de l'assistance"
                      multiline
                    />
                  )}
                </View>

                {/** Autres */}
                <View style={styles.formRow}>
                  <TouchableOpacity
                    style={styles.formLabel}
                    onPress={() => setAutresChecked(!autresChecked)}
                  >
                    <Icon
                      name={autresChecked ? 'check-box' : 'check-box-outline-blank'}
                      size={20}
                      color={autresChecked ? '#27ae60' : '#bdc3c7'}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.formLabelText}>Autres</Text>
                  </TouchableOpacity>
                  {autresChecked && (
                    <TextInput
                      style={styles.formInput}
                      value={autresText}
                      onChangeText={setAutresText}
                      placeholder="Autres détails"
                    />
                 

                  )}
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.noItemsText}>Aucune réclamation à valider</Text>
          )}
        </View>

     <Text style={styles.sectionTitle}>Date d'Examen</Text>
        <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
          <Text style={styles.dateButtonText}>
            {selectedDate ? selectedDate.toLocaleDateString() : 'Sélectionner une date'}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
        />

        <TouchableOpacity
          style={[styles.validateButton, loading && styles.disabledButton]}
          onPress={handleValidation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.validateButtonText}>Valider</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f6',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  viewReclamationButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  viewReclamationText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  selectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  selectionText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 10,
  },
  noItemsText: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    paddingVertical: 10,
  },
  formContainer: {
    marginTop: 10,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  formLabel: {
    flex: 0,
    minWidth: 250,
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  formInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    marginLeft: 10,
    fontSize: 14,
    color: '#2c3e50',
  },
  dateButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  validateButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  validateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RapportDetailScreen;
