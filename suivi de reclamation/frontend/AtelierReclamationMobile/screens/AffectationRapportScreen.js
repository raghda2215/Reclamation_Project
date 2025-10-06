import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Animated } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AffectationRapportScreen = ({ route, navigation }) => {
  const [rapports, setRapports] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [selectedResponsablesPerRapport, setSelectedResponsablesPerRapport] = useState({});
  const [dateAffectationPerRapport, setDateAffectationPerRapport] = useState({});
  const [showDatePickerPerRapport, setShowDatePickerPerRapport] = useState({});
  const [loading, setLoading] = useState(true);
  const [rapportLoading, setRapportLoading] = useState(null);
  const [scaleValue] = useState(new Animated.Value(1));

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchRapports(), fetchResponsables()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchRapports = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await axios.get('http://192.168.1.18:8000/api/rapports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRapports(response.data);
      const initialSelections = response.data.reduce((acc, rapport) => {
        acc[rapport.id] = [];
        return acc;
      }, {});
      const initialDates = response.data.reduce((acc, rapport) => {
        acc[rapport.id] = new Date();
        return acc;
      }, {});
      const initialShow = response.data.reduce((acc, rapport) => {
        acc[rapport.id] = false;
        return acc;
      }, {});
      setSelectedResponsablesPerRapport(initialSelections);
      setDateAffectationPerRapport(initialDates);
      setShowDatePickerPerRapport(initialShow);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les rapports');
    }
  };

  const fetchResponsables = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await axios.get('http://192.168.1.18:8000/api/responsables', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const uniqueResponsables = response.data.filter((resp, index, self) =>
        index === self.findIndex((r) => r.id === resp.id)
      );
      if (uniqueResponsables.length !== response.data.length) {
        console.warn('Doublons détectés dans les IDs des responsables, seuls les uniques sont conservés');
      }
      setResponsables(uniqueResponsables);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les responsables');
    }
  };

  const handleAffectation = async (rapportId) => {
    const rapportSelectedResponsables = selectedResponsablesPerRapport[rapportId] || [];
    const rapportDateAffectation = dateAffectationPerRapport[rapportId] || new Date();
    if (rapportSelectedResponsables.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un responsable');
      return;
    }
    if (!rapportDateAffectation) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date d\'affectation');
      return;
    }
    setRapportLoading(rapportId);
    triggerAnimation();
    const token = await AsyncStorage.getItem('userToken');
    try {
      await axios.post(
        `http://192.168.1.18:8000/api/rapports/${rapportId}/affecter`,
        {
          responsable_ids: rapportSelectedResponsables,
          date_affectation: rapportDateAffectation.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Succès', 'Rapport affecté avec succès');
      fetchRapports();
      setShowDatePickerPerRapport((prev) => ({ ...prev, [rapportId]: false }));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'affecter le rapport');
    } finally {
      setRapportLoading(null);
    }
  };

  const toggleResponsableSelection = (rapportId, responsableId) => {
    triggerAnimation();
    setSelectedResponsablesPerRapport((prev) => {
      const currentSelections = prev[rapportId] || [];
      const newSelections = currentSelections.includes(responsableId)
        ? currentSelections.filter((id) => id !== responsableId)
        : [...currentSelections, responsableId];
      return {
        ...prev,
        [rapportId]: newSelections,
      };
    });
  };

  const isResponsableSelected = (rapportId, responsableId) => {
    return (selectedResponsablesPerRapport[rapportId] || []).includes(responsableId);
  };

  const triggerAnimation = () => {
    scaleValue.setValue(1);
    Animated.spring(scaleValue, {
      toValue: 1.1,
      friction: 3,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    });
  };

  const onDateChange = (rapportId, event, selectedDate) => {
    const currentDate = selectedDate || dateAffectationPerRapport[rapportId];
    setShowDatePickerPerRapport((prev) => ({ ...prev, [rapportId]: false }));
    setDateAffectationPerRapport((prev) => ({ ...prev, [rapportId]: currentDate }));
  };

  const renderRapportItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.titre}</Text>
      <Text style={styles.cardContent}>{item.contenu.substring(0, 100)}...</Text>
      <View style={styles.responsablesContainer}>
        {responsables.map((responsable) => (
          <Animated.View
            key={`${item.id}-${responsable.id}`}
            style={[styles.responsableItem, isResponsableSelected(item.id, responsable.id) && styles.responsableSelected, { transform: [{ scale: scaleValue }] }]}
          >
            <TouchableOpacity
              onPress={() => toggleResponsableSelection(item.id, responsable.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.responsableText}>{responsable.name}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePickerPerRapport((prev) => ({ ...prev, [item.id]: true }))}>
        <Icon name="calendar-today" size={20} color="white" style={styles.icon} />
        <Text style={styles.buttonText}>
          Date d'affectation: {(dateAffectationPerRapport[item.id] || new Date()).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePickerPerRapport[item.id] && (
        <DateTimePicker
          value={dateAffectationPerRapport[item.id] || new Date()}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => onDateChange(item.id, event, selectedDate)}
          style={styles.datePicker}
        />
      )}
      <TouchableOpacity
        style={styles.affecterButton}
        onPress={() => handleAffectation(item.id)}
        disabled={rapportLoading === item.id}
      >
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          {rapportLoading === item.id ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Icon name="check-circle" size={20} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Affecter</Text>
            </>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={rapports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRapportItem}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 10,
  },
  cardContent: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  responsablesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  responsableItem: {
    borderWidth: 1.5,
    borderColor: '#D3DCE6',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  responsableSelected: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  responsableText: {
    fontSize: 14,
    color: '#34495E',
  },
  dateButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  affecterButton: {
    backgroundColor: '#2C3E50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 5,
  },
  icon: {
    marginRight: 5,
  },
  datePicker: {
    width: '100%',
    marginBottom: 15,
  },
});

export default AffectationRapportScreen;