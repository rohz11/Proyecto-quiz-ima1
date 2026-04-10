//para mostrar el perfil de manera provisional 
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function ProfileScreen() {
  const { nombre, apellido, email, rol, imagen } = useLocalSearchParams<{
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    imagen?: string;
  }>();

  const getInitials = () => {
    return (nombre?.charAt(0) || '') + (apellido?.charAt(0) || '');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido!</Text>
      
      {imagen ? (
        <Image source={{ uri: imagen }} style={styles.image} />
      ) : (
        <View style={styles.initials}>
          <Text style={styles.initialsText}>{getInitials()}</Text>
        </View>
      )}
      
      <Text style={styles.name}>{nombre} {apellido}</Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.rol}>Rol: {rol}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={() => {
        router.replace('/(tabs)');
      }}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  initials: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  initialsText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  rol: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
