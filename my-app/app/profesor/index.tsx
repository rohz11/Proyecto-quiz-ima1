import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Header } from '@/components/Header';
import { SectionTitle } from '@/components/SectionTitle';
import { Card, CardContent } from '@/components/Card';
import Colors from '@/constants/colors';
import { Usuario } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { listarQuices } from '@/utils/api';
import QuizCardWithMenu from '@/components/QuizCardWithMenu';

export default function ProfesorDashboardScreen() {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);

  useEffect(() => {
    cargarUsuarioActual();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      cargarUsuarioActual();
      cargarQuicesRecientes();

      // Prevenir gesto de atrás
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
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
  
  // Cargo los 3 quices más recientes para mostrar en el inicio
  const cargarQuicesRecientes = async () => {
    try {
      setCargandoQuices(true);
      const userJson = await SecureStore.getItemAsync('user');
      const usuario = userJson ? JSON.parse(userJson) : null;
      const autorId = usuario?.usu_id || 1;
      
      const resultado = await listarQuices(autorId);
      // Tomar solo los 3 más recientes
      const recientes = (resultado.quices || []).slice(0, 3);
      setQuicesRecientes(recientes);
    } catch (error) {
      console.error('Error cargando quices:', error);
    } finally {
      setCargandoQuices(false);
    }
  };

  const irAPerfil = () => {
    // Perfil se accede desde el tab de navegación
  };

  interface Quiz {
    _id: string;
    titulo: string;
    tema: string;
    cantidad_preguntas: number;
    fecha_creacion: string;
    imagen_portada?: string | null;
  }
  
  interface InformeResumen {
    titulo: string;
    descripcion: string;
    valor: string;
    icono: string;
    color: string;
  }
  
  const [quicesRecientes, setQuicesRecientes] = useState<Quiz[]>([]);
  const [informes, setInformes] = useState<InformeResumen[]>([]);
  const [cargandoQuices, setCargandoQuices] = useState(true);

  // Plantillas disponibles
  const plantillas = [
    { nombre: 'Evaluación Rápida', descripcion: '10 preguntas de opción múltiple', icono: 'timer', color: Colors.primary },
    { nombre: 'Examen Final', descripcion: '50 preguntas mixtas', icono: 'school', color: Colors.secondary },
    { nombre: 'Prueba Diagnóstica', descripcion: '20 preguntas básicas', icono: 'clipboard', color: Colors.accent },
    { nombre: 'Cuestionario en Blanco', descripcion: 'Empezar desde cero', icono: 'document', color: '#666' },
  ];

  return (
    <View style={styles.container}>
      <Header
        showProfile={true}
        profileImage={usuarioActual?.usu_imagen}
        profileName={usuarioActual?.usu_nombre}
        profileLastName={usuarioActual?.usu_apellido}
        onProfilePress={() => router.push('/profesor/perfil' as any)}
      />

      <SectionTitle title="Inicio" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Sección Biblioteca - Cuestionarios Recientes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Biblioteca</Text>
            <TouchableOpacity onPress={() => router.push('/profesor/biblioteca' as any)}>
              <Text style={styles.verTodo}>Ver todo →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>Cuestionarios recientes</Text>
          {quicesRecientes.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.quicesScroll}
              contentContainerStyle={styles.quicesScrollContent}
            >
              {quicesRecientes.map((quiz) => (
                <QuizCardWithMenu
                  key={quiz._id}
                  _id={quiz._id}
                  titulo={quiz.titulo}
                  tema={quiz.tema}
                  cantidad_preguntas={quiz.cantidad_preguntas}
                  fecha_creacion={quiz.fecha_creacion}
                  imagen_portada={quiz.imagen_portada}
                  size="small"
                  onPresentar={(id: string) => router.push(`/profesor/sesion/crear?quizId=${id}` as any)}
                  onEditar={(id: string) => router.push(`/profesor/quiz/editar/${id}` as any)}
                  onEliminado={cargarQuicesRecientes}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="library-outline" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>
                {cargandoQuices ? 'Cargando...' : 'No hay quices recientes'}
              </Text>
              {!cargandoQuices && (
                <TouchableOpacity 
                  style={styles.crearButtonSmall}
                  onPress={() => router.push('/profesor/crear' as any)}
                >
                  <Text style={styles.crearButtonTextSmall}>Crear mi primer quiz</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Sección Informes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informes</Text>
            <TouchableOpacity onPress={() => router.push('/profesor/reportes' as any)}>
              <Text style={styles.verTodo}>Ver todo →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>Resumen de actividad</Text>
          {informes.length > 0 ? (
            <Card style={styles.informesCard}>
              <CardContent>
                {informes.map((informe, index) => (
                  <View key={index}>
                    <View style={styles.informeRow}>
                      <View style={[styles.informeIconContainer, { backgroundColor: `${informe.color}20` }]}>
                        <Ionicons name={informe.icono as any} size={28} color={informe.color} />
                      </View>
                      <View style={styles.informeInfo}>
                        <Text style={styles.informeTitle}>{informe.titulo}</Text>
                        <Text style={styles.informeValue}>{informe.valor}</Text>
                      </View>
                    </View>
                    {index < informes.length - 1 && <View style={styles.informeDivider} />}
                  </View>
                ))}
              </CardContent>
            </Card>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>No hay informes disponibles</Text>
            </View>
          )}
        </View>

        {/* Sección Plantillas */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Plantillas</Text>
          <Text style={styles.sectionSubtitle}>Empieza rápido con una plantilla</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plantillasScroll}>
            {plantillas.map((plantilla, index) => (
              <TouchableOpacity key={index} style={styles.plantillaCard}>
                <View style={[styles.plantillaIconContainer, { backgroundColor: `${plantilla.color}20` }]}>
                  <Ionicons name={plantilla.icono as any} size={28} color={plantilla.color} />
                </View>
                <Text style={styles.plantillaNombre}>{plantilla.nombre}</Text>
                <Text style={styles.plantillaDescripcion}>{plantilla.descripcion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

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
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  // Plantillas
  plantillasScroll: {
    marginTop: 8,
  },
  plantillaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantillaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  plantillaNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  plantillaDescripcion: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  bottomPadding: {
    height: 100,
  },
  // Sección header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  verTodo: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Biblioteca items
  itemCard: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  itemAction: {
    padding: 8,
  },
  // Informes
  informesCard: {
    marginBottom: 8,
  },
  informeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  informeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  informeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  informeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  informeValue: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  informeDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  // Scroll de quices en inicio con espaciado
  quicesScroll: {
    marginTop: 8,
  },
  quicesScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  crearButtonSmall: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  crearButtonTextSmall: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
