import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ImageBackground, 
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function HomeScreen({ onLogout, navigation }) {
  const [userRole, setUserRole] = React.useState('');
  const [userName, setUserName] = React.useState('');

  useEffect(() => {
    const getUserInfo = async () => {
      const role = await AsyncStorage.getItem('userRole');
      const name = await AsyncStorage.getItem('userName') || 'Utilisateur';
      setUserRole(role || 'Inconnu');
      setUserName(name);
    };
    getUserInfo();
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleButtonPress = (screen) => {
    if (navigation) {
      navigation.navigate(screen);
    }
  };

  const renderAdminButtons = () => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>Administration</Text>
      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => handleButtonPress('Client')}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#4a6da7' }]}>
          <Text style={styles.iconText}>👥</Text>
        </View>
        <View style={styles.menuCardContent}>
          <Text style={styles.menuCardTitle}>Gérer les Clients</Text>
          <Text style={styles.menuCardDescription}>
            Ajouter, modifier ou supprimer des clients
          </Text>
        </View>
      </TouchableOpacity>
  {/* Affecter Rapports */}
 <TouchableOpacity
  style={styles.menuCard}
  onPress={() => handleButtonPress('AffectationRapports')}
>
  <View style={[styles.iconContainer, { backgroundColor: '#16a085' }]}>
    <Text style={styles.iconText}>📑</Text>
  </View>
  <View style={styles.menuCardContent}>
    <Text style={styles.menuCardTitle}>Affecter les Rapports</Text>
    <Text style={styles.menuCardDescription}>
      Assigner les rapports aux responsables qualité
    </Text>
  </View>
</TouchableOpacity>


 <TouchableOpacity
  style={styles.menuCard}
  onPress={() => handleButtonPress('Rapport')}
>
  <View style={[styles.iconContainer, { backgroundColor: '#16a085' }]}>
    <Text style={styles.iconText}>📑</Text>
  </View>
  <View style={styles.menuCardContent}>
    <Text style={styles.menuCardTitle}>les Rapports</Text>
    <Text style={styles.menuCardDescription}>
      consulter les Rapports
    </Text>
  </View>
</TouchableOpacity>
 <TouchableOpacity
        style={styles.menuCard}
        onPress={() => handleButtonPress('Photo')}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#9b59b6' }]}>
          <Text style={styles.iconText}>📷</Text>
        </View>
        <View style={styles.menuCardContent}>
          <Text style={styles.menuCardTitle}>Consulter les Photos de Réclamation</Text>
          <Text style={styles.menuCardDescription}>
            Visualiser les photos associées aux réclamations
          </Text>
        </View>
      </TouchableOpacity>
       <TouchableOpacity
        style={styles.menuCard}
        onPress={() => handleButtonPress('SendNotification')}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#e74c3c' }]}>
          <Text style={styles.iconText}>🔔</Text>
        </View>
        <View style={styles.menuCardContent}>
          <Text style={styles.menuCardTitle}>Envoyer une Notification</Text>
          <Text style={styles.menuCardDescription}>
            Notifier un utilisateur d'une nouvelle réclamation
          </Text>
        </View>
      </TouchableOpacity>

  </View>
);

  const renderCommercialButtons = () => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>Commercial</Text>
      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => handleButtonPress('Reclamation')}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#e67e22' }]}>
          <Text style={styles.iconText}>📝</Text>
        </View>
        <View style={styles.menuCardContent}>
          <Text style={styles.menuCardTitle}>Ajouter des Réclamations</Text>
          <Text style={styles.menuCardDescription}>
            Enregistrer les réclamations des clients
          </Text>
        </View>
      </TouchableOpacity>
<TouchableOpacity
        style={styles.menuCard}
        onPress={() => handleButtonPress('AddPhoto')}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#8e44ad' }]}>
          <Text style={styles.iconText}>📸</Text>
        </View>
        <View style={styles.menuCardContent}>
          <Text style={styles.menuCardTitle}>Ajouter des Photos</Text>
          <Text style={styles.menuCardDescription}>
            Uploader des photos pour les réclamations
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderQualiteButtons = () => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>Qualité</Text>
     
<TouchableOpacity
  style={styles.menuCard}
  onPress={() => handleButtonPress('MesRapports')}
>
  <View style={[styles.iconContainer, { backgroundColor: '#16a085' }]}>
    <Text style={styles.iconText}>📑</Text>
  </View>
  <View style={styles.menuCardContent}>
    <Text style={styles.menuCardTitle}>Mes Rapports Affectés</Text>
    <Text style={styles.menuCardDescription}>
      Voir et valider les rapports qui me sont assignés
    </Text>
  </View>
</TouchableOpacity>




    
     
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop' }}
          style={styles.headerBackground}
          imageStyle={{ opacity: 0.3 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Bienvenue !</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userRole}</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {userRole.toLowerCase() === 'administratif' && renderAdminButtons()}
        {userRole.toLowerCase() === 'commercial' && renderCommercialButtons()}
        {userRole.toLowerCase() === 'responsable_qualite' && renderQualiteButtons()}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 180,
    width: '100%',
  },
  headerBackground: {
    flex: 1,
    backgroundColor: '#0066cc',
    justifyContent: 'flex-end',
  },
  headerContent: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  menuSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5,
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  menuCardContent: {
    flex: 1,
    padding: 15,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  menuCardDescription: {
    fontSize: 13,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
