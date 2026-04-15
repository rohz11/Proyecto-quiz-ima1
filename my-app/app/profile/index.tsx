import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/utils/api';
import Colors from '@/constants/colors';
import { Header } from '@/components/Header';
import { LogoutButton } from '@/components/LogoutButton';
import { getInitials, pickImage } from '@/utils';

export default function ProfileScreen() {
  const { nombre, apellido, email, rol, imagen } = useLocalSearchParams<{
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    imagen?: string;
  }>();

  const [isEditing, setIsEditing] = useState(false);
  const [editNombre, setEditNombre] = useState(nombre || '');
  const [editApellido, setEditApellido] = useState(apellido || '');
  const [editEmail, setEditEmail] = useState(email || '');
  const [editImagen, setEditImagen] = useState(imagen || '');

  const handlePickImage = async () => {
    const image = await pickImage();
    if (image) setEditImagen(image);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('user');
    router.replace('/(tabs)');
  };

  const handleSave = async () => {
    try {
      const userJson = await SecureStore.getItemAsync('user');
      if (!userJson) {
        Alert.alert('Error', 'No se encontró información del usuario');
        return;
      }

      const usuario = JSON.parse(userJson);
      const userId = usuario.usu_id;

      const response = await fetch(`${API_URL}/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usu_nombre: editNombre,
          usu_apellido: editApellido,
          usu_email: editEmail,
          usu_imagen: editImagen || null,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Actualizar datos en SecureStore
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
        
        // Actualizar los datos mostrados
        setIsEditing(false);
        Alert.alert('Éxito', 'Datos actualizados correctamente');
        
        // Recargar la pantalla con los nuevos datos
        router.replace({
          pathname: '/profile',
          params: {
            nombre: updatedUser.usu_nombre,
            apellido: updatedUser.usu_apellido,
            email: updatedUser.usu_email,
            rol: usuario.rol_nombre,
            imagen: updatedUser.usu_imagen || ''
          }
        });
      } else {
        Alert.alert('Error', 'No se pudieron guardar los cambios');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar los cambios');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={isEditing ? handlePickImage : undefined} disabled={!isEditing}>
            {editImagen ? (
              <Image source={{ uri: editImagen }} style={styles.profileImage} />
            ) : imagen ? (
              <Image source={{ uri: imagen }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profilePlaceholderText}>{getInitials(nombre, apellido)}</Text>
              </View>
            )}
            {isEditing && (
              <View style={styles.editImageOverlay}>
                <Text style={styles.editImageIcon}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={styles.userName}>{nombre} {apellido}</Text>
          <Text style={styles.userRole}>{rol}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Nombre</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editNombre}
                onChangeText={setEditNombre}
              />
            ) : (
              <Text style={styles.infoValue}>{nombre}</Text>
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Apellido</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editApellido}
                onChangeText={setEditApellido}
              />
            ) : (
              <Text style={styles.infoValue}>{apellido}</Text>
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{email}</Text>
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Rol</Text>
            <Text style={styles.infoValue}>{rol}</Text>
          </View>
        </View>

        <View style={styles.buttonSection}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}

          <LogoutButton onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profilePlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageIcon: {
    fontSize: 20,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  infoInput: {
    fontSize: 18,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  editButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
