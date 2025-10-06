import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function AddPhotoScreen({ navigation }) {
  const [reclamations, setReclamations] = useState([]);
  const [selectedReclamation, setSelectedReclamation] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchReclamations();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Demander les permissions pour la galerie
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      // Demander les permissions pour la caméra
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      
      if (galleryStatus.status !== 'granted' || cameraStatus.status !== 'granted') {
        Alert.alert(
          'Permissions requises', 
          'Pour fonctionner correctement, l\'application a besoin d\'accéder à votre galerie et votre caméra.',
          [
            { text: 'OK', onPress: () => console.log('Alerte de permission fermée') }
          ]
        );
      } else {
        console.log('Toutes les permissions accordées');
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permissions:', error);
    }
  };

  const fetchReclamations = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await axios.get('http://192.168.1.18:8000/api/reclamations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReclamations(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les réclamations');
    } finally {
      setLoading(false);
    }
  };

  const pickImages = async () => {
    try {
      console.log('Ouverture de la galerie...');
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: false,
      });

      console.log('Résultat galerie:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets) {
        console.log(`${result.assets.length} image(s) sélectionnée(s)`);
        setSelectedImages(prevImages => [...prevImages, ...result.assets]);
        Alert.alert('Succès', `${result.assets.length} photo(s) ajoutée(s)`);
      }
    } catch (error) {
      console.error('Erreur galerie:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner les images');
    }
  };

  const takePhoto = async () => {
    try {
      console.log('=== DÉBUT PRISE DE PHOTO ===');
      
      // Vérifier si la caméra est disponible
      const cameraAvailable = await ImagePicker.isCameraAvailableAsync();
      console.log('Caméra disponible:', cameraAvailable);
      
      if (!cameraAvailable) {
        Alert.alert('Erreur', 'Caméra non disponible sur cet appareil');
        return;
      }

      // Demander les permissions
      console.log('Demande de permission caméra...');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Statut permission caméra:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise', 
          'Nous avons besoin de la permission pour utiliser la caméra',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Paramètres', onPress: () => console.log('Rediriger vers paramètres') }
          ]
        );
        return;
      }

      console.log('Lancement de la caméra...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: false,
      });

      console.log('Résultat caméra:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Photo prise avec succès:', result.assets[0].uri);
        setSelectedImages(prevImages => [...prevImages, ...result.assets]);
        Alert.alert('Succès', 'Photo ajoutée avec succès');
      } else if (result.canceled) {
        console.log('Prise de photo annulée par l\'utilisateur');
      } else {
        console.log('Aucune photo capturée');
      }
    } catch (error) {
      console.error('=== ERREUR CAMÉRA ===');
      console.error('Type d\'erreur:', typeof error);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Erreur complète:', JSON.stringify(error, null, 2));
      
      Alert.alert(
        'Erreur de caméra', 
        `Impossible d'utiliser la caméra: ${error.message || 'Erreur inconnue'}`
      );
    }
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  const uploadPhotos = async () => {
    if (!selectedReclamation) {
      Alert.alert('Erreur', 'Veuillez sélectionner une réclamation');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins une photo');
      return;
    }

    setUploading(true);
    const token = await AsyncStorage.getItem('userToken');

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const fileName = `photo_${Date.now()}_${i}.jpg`;
        const formData = new FormData();
        
        // Ajouter le fichier photo
        formData.append('photo', {
          uri: image.uri,
          type: 'image/jpeg',
          name: fileName,
        });
        
        // Ajouter les champs requis
        formData.append('reclamation_id', selectedReclamation.toString());
        formData.append('url', `http://192.168.1.18:8000/storage/photos/${fileName}`); // URL complète

        console.log('FormData créé pour:', {
          uri: image.uri,
          reclamation_id: selectedReclamation,
          fileName: fileName,
          url: `http://192.168.1.18:8000/storage/photos/${fileName}`
        });

        const response = await axios.post('http://192.168.1.18:8000/api/photos', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        });

        console.log('Réponse upload réussie:', response.data);
      }

      Alert.alert('Succès', 'Photos uploadées avec succès', [
        { text: 'OK', onPress: () => {
          setSelectedImages([]);
          setSelectedReclamation('');
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      console.error('Erreur upload complète:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      Alert.alert(
        'Erreur d\'upload', 
        error.response?.data?.message || `Erreur: ${error.message}`
      );
    } finally {
      setUploading(false);
    }
  };

  // Ajoutez cette fonction pour vérifier si l'appareil a une caméra
  const checkCameraAvailability = async () => {
    const cameraAvailable = await ImagePicker.isCameraAvailableAsync();
    if (!cameraAvailable) {
      Alert.alert(
        'Caméra non disponible',
        'Votre appareil ne semble pas avoir de caméra disponible.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const showImageOptions = () => {
    Alert.alert(
      'Ajouter une photo',
      'Choisissez une option',
      [
        { 
          text: 'Galerie', 
          onPress: () => {
            console.log('Option galerie sélectionnée');
            pickImages();
          }
        },
        { 
          text: 'Caméra', 
          onPress: () => {
            console.log('Option caméra sélectionnée');
            takePhoto();
          }
        },
        { 
          text: 'Annuler', 
          style: 'cancel',
          onPress: () => console.log('Sélection annulée')
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter des Photos</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Sélection de réclamation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réclamation*</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedReclamation ? 
                reclamations.find(r => r.id === selectedReclamation)?.titre || 'Réclamation sélectionnée' : 
                'Sélectionner une réclamation'
              }
            </Text>
            <Text style={styles.dropdownArrow}>
              {dropdownOpen ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          
          {dropdownOpen && (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
              {reclamations.map((reclamation) => (
                <TouchableOpacity
                  key={reclamation.id}
                  style={[
                    styles.dropdownItem,
                    selectedReclamation === reclamation.id && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setSelectedReclamation(reclamation.id);
                    setDropdownOpen(false);
                  }}
                >
                  <View style={styles.reclamationInfo}>
                    <Text style={[
                      styles.reclamationTitle,
                      selectedReclamation === reclamation.id && styles.dropdownItemTextSelected
                    ]}>
                      {reclamation.titre}
                    </Text>
                    <Text style={[
                      styles.reclamationClient,
                      selectedReclamation === reclamation.id && styles.reclamationClientSelected
                    ]}>
                      Client: {reclamation.client?.nom}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: 
                        reclamation.statut === 'resolu' ? '#2ecc71' :
                        reclamation.statut === 'en_cours' ? '#3498db' : '#f39c12'
                      }
                    ]}>
                      <Text style={styles.statusText}>
                        {reclamation.statut === 'resolu' ? 'Résolu' :
                         reclamation.statut === 'en_cours' ? 'En cours' : 'En attente'}
                      </Text>
                    </View>
                  </View>
                  {selectedReclamation === reclamation.id && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Section photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          
          <TouchableOpacity style={styles.addPhotoButton} onPress={showImageOptions}>
            <Text style={styles.addPhotoIcon}>📷</Text>
            <Text style={styles.addPhotoText}>Ajouter des photos</Text>
          </TouchableOpacity>

          {selectedImages.length > 0 && (
            <View style={styles.imageGrid}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bouton d'upload */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (uploading || selectedImages.length === 0 || !selectedReclamation) && styles.uploadButtonDisabled
          ]}
          onPress={uploadPhotos}
          disabled={uploading || selectedImages.length === 0 || !selectedReclamation}
        >
          {uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.uploadButtonText}>
              Uploader {selectedImages.length} photo{selectedImages.length > 1 ? 's' : ''}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    color: 'white',
    fontSize: 16,
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
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
  dropdownItemTextSelected: {
    color: '#0066cc',
    fontWeight: '600',
  },
  reclamationInfo: {
    flex: 1,
  },
  reclamationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  reclamationClient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  reclamationClientSelected: {
    color: '#0066cc',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkMark: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: 'bold',
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  addPhotoIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  addPhotoText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageContainer: {
    position: 'relative',
    width: (width - 52) / 3,
    height: (width - 52) / 3,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  uploadButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

















