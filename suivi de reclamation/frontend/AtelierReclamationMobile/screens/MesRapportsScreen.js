import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MesRapportsScreen = ({ navigation }) => {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMesRapports();
  }, []);

  const fetchMesRapports = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await axios.get('http://192.168.1.18:8000/api/mes-rapports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRapports(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer vos rapports');
    } finally {
      setLoading(false);
    }
  };

  const renderRapportItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('RapportDetail', { rapport: item })}
    >
      <Text style={[styles.cell, styles.titleCell]}>{item.titre}</Text>
      <Text style={styles.cell}>
        {item.responsables?.[0]?.pivot?.date_affectation
          ? new Date(item.responsables[0].pivot.date_affectation).toLocaleDateString()
          : 'Non spécifiée'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mes Rapports Affectés</Text>
      {rapports.length === 0 ? (
        <Text style={styles.emptyText}>Aucun rapport affecté pour le moment.</Text>
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.titleCell]}>Titre du Rapport</Text>
            <Text style={styles.headerCell}>Date d'Affectation</Text>
          </View>
          <FlatList
            data={rapports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRapportItem}
            contentContainerStyle={styles.tableBody}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginVertical: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  table: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerCell: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  titleCell: {
    flex: 2,
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
  },
  tableBody: {
    paddingBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default MesRapportsScreen;