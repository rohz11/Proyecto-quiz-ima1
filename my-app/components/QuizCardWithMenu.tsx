import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { eliminarQuiz } from '@/utils/api';
import { QuizCardWithMenuProps } from '@/types/components';

export default function QuizCardWithMenu({
  _id,
  titulo,
  tema,
  cantidad_preguntas,
  fecha_creacion,
  imagen_portada,
  size = 'medium',
  onPresentar,
  onEditar,
  onEliminado,
}: QuizCardWithMenuProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  const abrirMenu = () => {
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  const cerrarMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const handlePresentar = () => {
    cerrarMenu();
    setTimeout(() => onPresentar?.(_id), 250);
  };

  const handleEditar = () => {
    cerrarMenu();
    setTimeout(() => onEditar?.(_id), 250);
  };

  const handleEliminar = () => {
    Alert.alert(
      '¿Eliminar quiz?',
      `¿Estás seguro de que quieres eliminar "${titulo}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setEliminando(true);
              await eliminarQuiz(_id);
              onEliminado?.();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar el quiz');
            } finally {
              setEliminando(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const config = {
    small: {
      cardWidth: 160,
      portadaHeight: 90,
      titleSize: 14,
      materiaSize: 12,
      padding: 10,
      badgePadding: { horizontal: 6, vertical: 2 },
      iconSize: 32,
    },
    medium: {
      cardWidth: '100%', // Ocupa todo el ancho del contenedor padre
      portadaHeight: 120,
      titleSize: 15,
      materiaSize: 13,
      padding: 12,
      badgePadding: { horizontal: 8, vertical: 4 },
      iconSize: 40,
    },
    large: {
      cardWidth: '100%',
      portadaHeight: 160,
      titleSize: 18,
      materiaSize: 14,
      padding: 16,
      badgePadding: { horizontal: 10, vertical: 5 },
      iconSize: 48,
    },
  };

  const c = config[size];

  return (
    <>
      <TouchableOpacity
        style={[
          styles.card,
          {
            width: c.cardWidth as any,
            marginBottom: size === 'small' ? 0 : 12,
          },
        ]}
        onPress={abrirMenu}
        activeOpacity={0.9}
      >
        <View style={[styles.portadaContainer, { height: c.portadaHeight }]}>
          {imagen_portada ? (
            <Image source={{ uri: imagen_portada }} style={styles.portadaImage} />
          ) : (
            <View style={styles.portadaPlaceholder}>
              <Ionicons
                name={size === 'small' ? 'help-circle' : 'image-outline'}
                size={c.iconSize}
                color="#ccc"
              />
            </View>
          )}
          <View
            style={[
              styles.preguntasBadge,
              {
                paddingHorizontal: c.badgePadding.horizontal,
                paddingVertical: c.badgePadding.vertical,
              },
            ]}
          >
            <Text style={styles.preguntasText}>
              {cantidad_preguntas} {size !== 'small' && 'preg'}
            </Text>
          </View>
        </View>

        <View style={[styles.infoContainer, { padding: c.padding }]}>
          <Text style={[styles.titulo, { fontSize: c.titleSize }]} numberOfLines={2}>
            {titulo}
          </Text>
          {tema && (
            <Text style={[styles.materia, { fontSize: c.materiaSize }]}>
              {tema}
            </Text>
          )}
          {size !== 'small' && (
            <Text style={styles.fecha}>{formatDate(fecha_creacion)}</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Modal de opciones */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={cerrarMenu}
      >
        <Pressable style={styles.overlay} onPress={cerrarMenu}>
          <Animated.View
            style={[
              styles.menuContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Header con info del quiz */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle} numberOfLines={1}>
                {titulo}
              </Text>
              <Text style={styles.menuSubtitle}>
                {cantidad_preguntas} preguntas • {tema || 'Sin materia'}
              </Text>
            </View>

            {/* Opciones */}
            <View style={styles.menuOptions}>
              <TouchableOpacity
                style={[styles.menuOption, eliminando && styles.menuOptionDisabled]}
                onPress={handlePresentar}
                disabled={eliminando}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${Colors.success}20` }]}>
                  <Ionicons name="play-circle" size={24} color={Colors.success} />
                </View>
                <View style={styles.menuOptionText}>
                  <Text style={styles.menuOptionTitle}>Presentar</Text>
                  <Text style={styles.menuOptionDesc}>Iniciar sesión de quiz</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuOption, eliminando && styles.menuOptionDisabled]}
                onPress={handleEditar}
                disabled={eliminando}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${Colors.primary}20` }]}>
                  <Ionicons name="create-outline" size={24} color={Colors.primary} />
                </View>
                <View style={styles.menuOptionText}>
                  <Text style={styles.menuOptionTitle}>Editar</Text>
                  <Text style={styles.menuOptionDesc}>Modificar preguntas</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuOption, styles.menuOptionDanger, eliminando && styles.menuOptionDisabled]}
                onPress={handleEliminar}
                disabled={eliminando}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${Colors.danger}20` }]}>
                  <Ionicons name="trash-outline" size={24} color={Colors.danger} />
                </View>
                <View style={styles.menuOptionText}>
                  <Text style={[styles.menuOptionTitle, styles.textDanger]}>Eliminar</Text>
                  <Text style={styles.menuOptionDesc}>Borrar permanentemente</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Botón cancelar */}
            <TouchableOpacity style={styles.cancelButton} onPress={cerrarMenu}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginRight: 12,
    marginLeft: 4,
  },
  portadaContainer: {
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  portadaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  portadaPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8e8e8',
  },
  preguntasBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  preguntasText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
  },
  titulo: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  materia: {
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 11,
    color: '#999',
  },
  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  menuHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  menuOptions: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuOptionDanger: {
    borderBottomWidth: 0,
  },
  menuOptionDisabled: {
    opacity: 0.5,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuOptionText: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuOptionDesc: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  textDanger: {
    color: Colors.danger,
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
