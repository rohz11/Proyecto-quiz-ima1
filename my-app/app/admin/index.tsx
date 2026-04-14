import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, BackHandler } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { SearchBar } from '@/components/SearchBar';
import { Badge } from '@/components/Badge';
import { SectionTitle } from '@/components/SectionTitle';
import { Header } from '@/components/Header';
import { API_URL } from '@/services/api';
import Colors from '@/constants/colors';
import { Usuario } from '@/types/user';
import { getInitials } from '@/utils';

export default function AdminScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);

  useEffect(() => {
    cargarUsuarioActual();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      cargarUsuarios();
      cargarUsuarioActual();

      // Prevenir gesto de atrás
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // No permitir volver atrás
        return true;
      });

      return () => backHandler.remove();
    }, [])
  );

  const cargarUsuarioActual = async () => {
    try {
      const userJson = await SecureStore.getItemAsync('user');
      if (userJson) {
        setUsuarioActual(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error al cargar usuario actual:', error);
    }
  };

  const cerrarSesion = async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const irAPerfil = () => {
    if (usuarioActual) {
      router.push({
        pathname: '/profile',
        params: {
          nombre: usuarioActual.usu_nombre,
          apellido: usuarioActual.usu_apellido,
          email: usuarioActual.usu_email,
          rol: usuarioActual.rol_nombre,
          imagen: usuarioActual.usu_imagen || ''
        }
      });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      cargarUsuarios();
      cargarUsuarioActual();
    }, [])
  );

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/usuarios/`);
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = usuarios
    .filter(usuario => usuario.usu_fk_rol !== 3) // Excluir usuarios master
    .filter(usuario =>
      `${usuario.usu_nombre} ${usuario.usu_apellido} ${usuario.usu_email}`.toLowerCase().includes(searchText.toLowerCase())
    );

  const navegarADetalle = (usuario: Usuario) => {
    router.push({
      pathname: '/admin/[id]',
      params: { id: usuario.usu_id.toString() }
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        showProfile={true}
        profileImage={usuarioActual?.usu_imagen}
        profileName={usuarioActual?.usu_nombre}
        profileLastName={usuarioActual?.usu_apellido}
        onProfilePress={irAPerfil}
      />

      <SectionTitle title="Panel de Control" />

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Buscar por nombre, apellido o email..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {usuariosFiltrados.map((usuario) => (
          <TouchableOpacity
            key={usuario.usu_id}
            style={styles.userItem}
            onPress={() => navegarADetalle(usuario)}
          >
            <View style={styles.userItemContent}>
              {usuario.usu_imagen ? (
                <Image source={{ uri: usuario.usu_imagen }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {getInitials(usuario.usu_nombre, usuario.usu_apellido)}
                  </Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{usuario.usu_nombre} {usuario.usu_apellido}</Text>
                <Text style={styles.userEmail}>{usuario.usu_email}</Text>
                <View style={styles.userMeta}>
                  <Badge text={usuario.rol_nombre} />
                  <Badge 
                    text={usuario.usu_activo ? 'Activo' : 'Inactivo'} 
                    variant={usuario.usu_activo ? 'success' : 'danger'} 
                  />
                </View>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  chevron: {
    fontSize: 28,
    color: '#ccc',
    marginLeft: 12,
  },
});
