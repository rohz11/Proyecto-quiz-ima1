import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { Card, CardContent } from '@/components/Card';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Usuario } from '@/types/user';
import { Reporte } from '@/types/quiz';

export default function ReportesScreen() {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const userJson = await SecureStore.getItemAsync('user');
        if (userJson) {
          setUsuarioActual(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      }
    };
    cargarUsuario();
  }, []);
  const [reportes, setReportes] = useState<Reporte[]>([]);

  return (
    <View style={styles.container}>
      <Header
        showProfile={true}
        profileImage={usuarioActual?.usu_imagen}
        profileName={usuarioActual?.usu_nombre}
        profileLastName={usuarioActual?.usu_apellido}
        onProfilePress={() => router.push('/profesor/perfil' as any)}
      />

      <SectionTitle title="Reportes" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {reportes.length > 0 ? (
          reportes.map((reporte, index) => (
            <Card key={index} style={styles.reporteCard}>
              <CardContent>
                <View style={styles.reporteRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={reporte.icono as any} size={28} color={Colors.primary} />
                  </View>
                  <View style={styles.reporteInfo}>
                    <Text style={styles.reporteTitulo}>{reporte.titulo}</Text>
                    <Text style={styles.reporteDescripcion}>{reporte.descripcion}</Text>
                  </View>
                  <Text style={styles.reporteValor}>{reporte.valor}</Text>
                </View>
              </CardContent>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No hay reportes disponibles</Text>
            <Text style={styles.emptyStateSubtext}>Los reportes aparecerán cuando los estudiantes completen cuestionarios</Text>
          </View>
        )}

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
  reporteCard: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  reporteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reporteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reporteTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reporteDescripcion: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  reporteValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  bottomPadding: {
    height: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
    textAlign: 'center',
  },
});
