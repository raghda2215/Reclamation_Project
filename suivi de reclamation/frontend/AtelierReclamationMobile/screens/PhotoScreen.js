import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Dimensions,
  Modal
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const imageWidth = (width - 40) / 2;

export default function PhotoScreen() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await axios.get('http://192.168.1.18:8000/api/photos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhotos(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des photos:', error.message);
      Alert.alert('Erreur', 'Impossible de récupérer les photos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPhotos();
    setRefreshing(false);
  };

  const openImageModal = (item) => {
    setSelectedImage(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.photoCard}
      onPress={() => openImageModal(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `http://192.168.1.18:8000${item.url}` }}
          style={styles.image}
          resizeMode="cover"
          onError={() => console.error(`Erreur de chargement: http://192.168.1.18:8000${item.url}`)}
        />
      </View>
      <View style={styles.photoInfo}>
        <Text style={styles.photoTitle} numberOfLines={1}>
          {item.reclamation?.titre || 'Photo sans réclamation'}
        </Text>
        <Text style={styles.photoDate} numberOfLines={1}>
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Date inconnue'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#3498db" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Galerie Photos</Text>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loaderText}>Chargement des photos...</Text>
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune photo disponible</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchPhotos}>
            <Text style={styles.refreshButtonText}>Rafraîchir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.photoGrid}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3498db']}
              tintColor="#3498db"
            />
          }
        />
      )}
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseArea}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              {selectedImage && (
                <>
                  <Image
                    source={{ uri: `http://192.168.1.18:8000${selectedImage.url}` }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalTitle}>
                      {selectedImage.reclamation?.titre || 'Photo sans réclamation'}
                    </Text>
                    {selectedImage.reclamation?.description && (
                      <Text style={styles.modalDescription}>
                        {selectedImage.reclamation.description}
                      </Text>
                    )}
                    {selectedImage.created_at && (
                      <Text style={styles.modalDate}>
                        Ajoutée le {new Date(selectedImage.created_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
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
    backgroundColor: '#3498db',
    padding: 15,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  photoGrid: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  photoCard: {
    width: imageWidth,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  imageContainer: {
    width: '100%',
    height: imageWidth,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  photoInfo: {
    padding: 10,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  photoDate: {
    fontSize: 12,
    color: '#777',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  modalInfo: {
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalDate: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  }
});
