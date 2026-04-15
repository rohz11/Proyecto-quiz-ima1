import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Dropdown } from '@/components/Dropdown';
import { Badge } from '@/components/Badge';
import { CustomModal } from '@/components/Modal';
import { Header } from '@/components/Header';
import { API_URL } from '@/utils/api';
import { Usuario, UsuarioEdit } from '@/types/user';
import { getInitials, pickImage } from '@/utils';

export default function UsuarioDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [accion, setAccion] = useState<'desactivar' | 'eliminar'>('desactivar');
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioEdit>({
    usu_nombre: '',
    usu_apellido: '',
    usu_email: '',
    usu_fk_rol: 1,
    usu_imagen: null,
  });

  const opcionesRol = [
    { label: 'Alumno', value: 1 },
    { label: 'Profesor', value: 2 },
  ];

  useEffect(() => {
    cargarUsuario();
  }, [id]);

  const cargarUsuario = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/usuarios/${id}`);
      const data = await response.json();
      setUsuario(data);
      setUsuarioEditando({
        usu_nombre: data.usu_nombre,
        usu_apellido: data.usu_apellido,
        usu_email: data.usu_email,
        usu_fk_rol: data.usu_fk_rol,
        usu_imagen: data.usu_imagen,
      });
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = async () => {
    if (!usuario) return;
    try {
      const response = await fetch(`${API_URL}/usuarios/${usuario.usu_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usu_activo: !usuario.usu_activo }),
      });
      if (response.ok) {
        cargarUsuario();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const eliminarUsuario = async () => {
    if (!usuario) return;
    try {
      const response = await fetch(`${API_URL}/usuarios/${usuario.usu_id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.back();
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  const guardarCambios = async () => {
    if (!usuario) return;
    try {
      const response = await fetch(`${API_URL}/usuarios/${usuario.usu_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioEditando),
      });
      if (response.ok) {
        setEditando(false);
        cargarUsuario();
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    }
  };

  const handlePickImage = async () => {
    const image = await pickImage();
    if (image) {
      setUsuarioEditando(prev => ({ ...prev, usu_imagen: image }));
    }
  };

  const confirmarAccion = (accionTipo: 'desactivar' | 'eliminar') => {
    setAccion(accionTipo);
    setModalVisible(true);
  };

  const ejecutarAccion = () => {
    if (accion === 'desactivar') {
      toggleActivo();
    } else if (accion === 'eliminar') {
      eliminarUsuario();
    }
    setModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando usuario...</Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Usuario no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={editando ? handlePickImage : undefined}>
            {editando ? (
              usuarioEditando.usu_imagen ? (
                <Image source={{ uri: usuarioEditando.usu_imagen }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {getInitials(usuarioEditando.usu_nombre, usuarioEditando.usu_apellido)}
                  </Text>
                </View>
              )
            ) : (
              usuario.usu_imagen ? (
                <Image source={{ uri: usuario.usu_imagen }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {getInitials(usuario.usu_nombre, usuario.usu_apellido)}
                  </Text>
                </View>
              )
            )}
            {editando && (
              <View style={styles.cameraOverlay}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{`${usuario.usu_nombre} ${usuario.usu_apellido}`}</Text>
          <Text style={styles.userEmail}>{usuario.usu_email}</Text>
          <View style={styles.badges}>
            <Badge text={usuario.rol_nombre} variant="info" />
            <Badge 
              text={usuario.usu_activo ? 'Activo' : 'Inactivo'} 
              variant={usuario.usu_activo ? 'success' : 'danger'} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          {editando ? (
            <>
              <Text style={styles.label}>Nombre:</Text>
              <TextInput
                style={styles.input}
                value={usuarioEditando.usu_nombre}
                onChangeText={(text) => setUsuarioEditando(prev => ({ ...prev, usu_nombre: text }))}
              />
              
              <Text style={styles.label}>Apellido:</Text>
              <TextInput
                style={styles.input}
                value={usuarioEditando.usu_apellido}
                onChangeText={(text) => setUsuarioEditando(prev => ({ ...prev, usu_apellido: text }))}
              />
              
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={styles.input}
                value={usuarioEditando.usu_email}
                onChangeText={(text) => setUsuarioEditando(prev => ({ ...prev, usu_email: text }))}
              />
              
              <Text style={styles.label}>Rol:</Text>
              <Dropdown
                options={opcionesRol}
                selectedValue={usuarioEditando.usu_fk_rol}
                onSelect={(value) => setUsuarioEditando(prev => ({ ...prev, usu_fk_rol: value }))}
              />
              
              <View style={styles.editButtons}>
                <TouchableOpacity style={styles.cancelEditButton} onPress={() => {
                  setEditando(false);
                  setUsuarioEditando({
                    usu_nombre: usuario.usu_nombre,
                    usu_apellido: usuario.usu_apellido,
                    usu_email: usuario.usu_email,
                    usu_fk_rol: usuario.usu_fk_rol,
                    usu_imagen: usuario.usu_imagen,
                  });
                }}>
                  <Text style={styles.cancelEditButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={guardarCambios}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nombre:</Text>
                <Text style={styles.infoValue}>{usuario.usu_nombre}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Apellido:</Text>
                <Text style={styles.infoValue}>{usuario.usu_apellido}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{usuario.usu_email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rol:</Text>
                <Text style={styles.infoValue}>{usuario.rol_nombre}</Text>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={() => setEditando(true)}>
                <Text style={styles.editButtonText}>✏️ Editar Información</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado</Text>
          <View style={styles.statusRow}>
            <Text style={styles.infoLabel}>Estado actual:</Text>
            <Badge 
              text={usuario.usu_activo ? 'Activo' : 'Inactivo'} 
              variant={usuario.usu_activo ? 'success' : 'danger'} 
            />
          </View>
          <TouchableOpacity 
            style={[styles.actionButton, !usuario.usu_activo && styles.activateButton]}
            onPress={() => confirmarAccion('desactivar')}
          >
            <Text style={styles.actionButtonText}>
              {usuario.usu_activo ? '🔴 Desactivar Usuario' : '🟢 Activar Usuario'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => confirmarAccion('eliminar')}
          >
            <Text style={styles.deleteButtonText}>🗑️ Eliminar Usuario</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={ejecutarAccion}
        title="Confirmar Acción"
        message={
          accion === 'eliminar'
            ? `¿Estás seguro de eliminar a ${usuario.usu_nombre} ${usuario.usu_apellido}? Esta acción no se puede deshacer.`
            : `¿Estás seguro de ${usuario.usu_activo ? 'desactivar' : 'activar'} a ${usuario.usu_nombre} ${usuario.usu_apellido}?`
        }
      />
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
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 50,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarPlaceholderText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIcon: {
    fontSize: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelEditButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelEditButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
