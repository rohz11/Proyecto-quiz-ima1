import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { Card, CardContent } from '@/components/Card';
import Colors from '@/constants/colors';
import { Usuario } from '@/types/user';
import { getInitials } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { LogoutButton } from '@/components/LogoutButton';

export default function PerfilScreen() {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      cargarUsuarioActual();
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

  const menuItems = [
    { icono: 'person', titulo: 'Editar Perfil', subtitulo: 'Actualiza tu información' },
    { icono: 'school', titulo: 'Mis Materias', subtitulo: 'Gestiona tus materias' },
    { icono: 'notifications', titulo: 'Notificaciones', subtitulo: 'Configura alertas' },
    { icono: 'shield', titulo: 'Privacidad', subtitulo: 'Ajustes de seguridad' },
    { icono: 'help-circle', titulo: 'Ayuda', subtitulo: 'Centro de ayuda' },
  ];

  return (
    <View style={styles.container}>
      <Header
        showProfile={true}
        profileImage={usuarioActual?.usu_imagen}
        profileName={usuarioActual?.usu_nombre}
        profileLastName={usuarioActual?.usu_apellido}
        onProfilePress={() => {}}
      />

      <SectionTitle title="Perfil" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Información del perfil */}
        <View style={styles.perfilHeader}>
          {usuarioActual?.usu_imagen ? (
            <Image source={{ uri: usuarioActual.usu_imagen }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {getInitials(usuarioActual?.usu_nombre, usuarioActual?.usu_apellido)}
              </Text>
            </View>
          )}
          <Text style={styles.nombre}>
            {usuarioActual?.usu_nombre} {usuarioActual?.usu_apellido}
          </Text>
          <Text style={styles.email}>{usuarioActual?.usu_email}</Text>
          <View style={styles.rolBadge}>
            <Text style={styles.rolText}>{usuarioActual?.rol_nombre || 'Profesor'}</Text>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>Cuestionarios</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>48</Text>
            <Text style={styles.statLabel}>Estudiantes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>5</Text>
            <Text style={styles.statLabel}>Materias</Text>
          </View>
        </View>

        {/* Menú de opciones */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icono as any} size={22} color={Colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitulo}>{item.titulo}</Text>
                <Text style={styles.menuSubtitulo}>{item.subtitulo}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón cerrar sesión */}
        <LogoutButton onPress={cerrarSesion} />

        <View style={styles.bottomPadding} />
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
  perfilHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: `${Colors.primary}50`,
  },
  avatarPlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  nombre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  rolBadge: {
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  rolText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuSubtitulo: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
});
