import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

export default function WelcomeScreen() {
  const [showButtons, setShowButtons] = useState(false);
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in del logo
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      // Esperar 2 segundos con logo visible
      setTimeout(() => {
        // Fade-out del logo
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          // Mostrar botones
          setShowButtons(true);
        });
      }, 2000);
    });
  }, []);

  return (
    <View style={styles.container}>
      {!showButtons && (
        <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
          <Text style={styles.logo}>QUIZIMA</Text>
          <Text style={styles.tagline}>Sistema de Evaluación Interactiva</Text>
        </Animated.View>
      )}
      
      {showButtons && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.studentButton]}
            onPress={() => router.push({ pathname: '/login', params: { type: 'student' } })}
          >
            <Text style={styles.buttonText}>Soy Estudiante</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.teacherButton]}
            onPress={() => router.push({ pathname: '/login', params: { type: 'teacher' } })}
          >
            <Text style={styles.buttonText}>Soy Profesor</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentButton: {
    backgroundColor: '#007AFF',
  },
  teacherButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
