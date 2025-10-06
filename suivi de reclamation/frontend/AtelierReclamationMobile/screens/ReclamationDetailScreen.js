import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ReclamationDetailScreen = ({ route, navigation }) => {
  const { reclamation } = route.params || {};

  // Parse formData safely
  let formData = {};
  try {
    formData = reclamation?.formData 
      ? (typeof reclamation.formData === 'string' 
          ? JSON.parse(reclamation.formData) 
          : reclamation.formData) 
      : {};
  } catch (error) {
    console.log('Erreur parsing formData:', error);
    formData = {};
  }

  // Ensure photos array exists
  const photos = Array.isArray(reclamation?.photos) ? reclamation.photos : [];

  // Client information
  const client = reclamation?.client || {};

  const renderPhotoItem = ({ item }) => (
    <View style={styles.photoContainer}>
      <Image
        source={{ uri: item.url ? `http://192.168.1.18:8000${item.url}` : 'https://via.placeholder.com/150' }}
        style={styles.photo}
        resizeMode="cover"
        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Réclamation {reclamation?.id || 'N/A'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Client Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📌 Informations Générales</Text>
          <Text style={styles.label}><Text style={styles.bold}>Nom :</Text> {client.nom || 'Non spécifié'}</Text>
          <Text style={styles.label}><Text style={styles.bold}>Email :</Text> {client.email || 'Non spécifié'}</Text>
          <Text style={styles.label}><Text style={styles.bold}>Téléphone :</Text> {client.telephone || 'Non spécifié'}</Text>
          <Text style={styles.label}><Text style={styles.bold}>Adresse :</Text> {client.adresse || 'Non spécifié'}</Text>
        </View>

        {/* Réclamation Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Détails de la Réclamation</Text>
          {Object.keys(formData).length === 0 ? (
            <Text style={styles.noDataText}>Aucune donnée de formulaire disponible</Text>
          ) : (
            <>
              {formData.nonMaitrise?.checked && (
                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Non maîtrise de la technique de collage</Text>
                  <Text style={styles.formValue}>{formData.nonMaitrise.value || 'Non spécifié'}</Text>
                </View>
              )}
              {formData.produitNonAdequat?.checked && (
                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Produit non adéquat ou support</Text>
                  <Text style={styles.formValue}>{formData.produitNonAdequat.value || 'Non spécifié'}</Text>
                </View>
              )}
              {formData.emballage?.checked && (
                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Emballage</Text>
                  <Text style={styles.formValue}>{formData.emballage.value || 'Non spécifié'}</Text>
                </View>
              )}
              {formData.service?.checked && (
                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Service</Text>
                  <Text style={styles.formValue}>{formData.service.value || 'Non spécifié'}</Text>
                </View>
              )}
              {formData.produit?.checked && (
                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Produit</Text>
                  <Text style={styles.formValue}>{formData.produit.value || 'Non spécifié'}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Photos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📷 Photos</Text>
          {photos.length === 0 ? (
            <Text style={styles.noDataText}>Aucune photo disponible</Text>
          ) : (
            <FlatList
              data={photos}
              renderItem={renderPhotoItem}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoList}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef3f9' },
  header: { backgroundColor: '#0066cc', paddingVertical: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', elevation: 5 },
  backButton: { marginRight: 12 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },
  scrollContent: { padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4, borderWidth: 1, borderColor: '#e6e6e6' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#004080', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 6 },
  label: { fontSize: 15, color: '#333', marginBottom: 8 },
  bold: { fontWeight: '600' },
  noDataText: { fontSize: 14, color: '#777', textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
  formRow: { marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 8 },
  formLabel: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  formValue: { fontSize: 14, color: '#555', paddingLeft: 6 },
  photoList: { paddingVertical: 8 },
  photoContainer: { marginRight: 10, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e6e6e6' },
  photo: { width: 150, height: 150 },
});

export default ReclamationDetailScreen;
