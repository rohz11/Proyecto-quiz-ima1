import { StyleSheet, View, Text, TextInput, TouchableOpacity, Switch, Image, Alert } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { login, register } from '@/services/api';
import { getInitials, pickImage } from '@/utils';
import Colors from '@/constants/colors';

export default function LoginScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const [isRegister, setIsRegister] = useState(false);
  const [isTeacher, setIsTeacher] = useState(type === 'teacher');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handlePickImage = async () => {
    const image = await pickImage();
    if (image) setProfileImage(image);
  };

  const handleSubmit = async () => {
    if (isRegister) {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }
      
      if (!name || !lastName || !email || !password) {
        Alert.alert('Error', 'Por favor completa todos los campos');
        return;
      }
      
      try {
        const data = await register({
          nombre: name,
          apellido: lastName,
          email: email,
          password: password,
          tipo: 'estudiante',
          imagen: profileImage || undefined
        });
        
        router.replace({
          pathname: '/profile' as any,
          params: {
            nombre: data.usuario.usu_nombre,
            apellido: data.usuario.usu_apellido,
            email: data.usuario.usu_email,
            rol: data.usuario.rol_nombre,
            imagen: data.usuario.usu_imagen || ''
          }
        });

      } catch (error: any) {
        Alert.alert('Error', error.message || 'Error en el registro');
      }
    } else {
      try {
        const data = await login(email, password);
        
        if (isTeacher && data.usuario.usu_fk_rol !== 2 && data.usuario.usu_fk_rol !== 3) {
          Alert.alert('Acceso denegado', 'Esta cuenta no tiene permisos de profesor. Contacta al administrador para solicitar acceso.');
          return;
        }
        
        // Guardar datos del usuario en SecureStore
        await SecureStore.setItemAsync('user', JSON.stringify(data.usuario));

        // Redirigir según el rol del usuario
        if (data.usuario.usu_fk_rol === 3) {
          // Master → admin
          router.replace('/admin' as any);
        } else if (data.usuario.usu_fk_rol === 2) {
          // Profesor → profesor dashboard
          router.replace('/profesor' as any);
        } else {
          // Estudiante → profile
          router.replace({
            pathname: '/profile' as any,
            params: {
              nombre: data.usuario.usu_nombre,
              apellido: data.usuario.usu_apellido,
              email: data.usuario.usu_email,
              rol: data.usuario.rol_nombre,
              imagen: data.usuario.usu_imagen || ''
            }
          });
        }
        
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Error al iniciar sesión');
      }
    }
  };

  return (
    <View style={styles.container}>
      {isRegister && (
        <TouchableOpacity style={styles.profileImageContainer} onPress={handlePickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileInitials}>
              <Text style={styles.profileInitialsText}>{getInitials(name, lastName)}</Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Text style={styles.cameraIconText}>📷</Text>
          </View>
        </TouchableOpacity>
      )}
      {!isRegister && (
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>👤</Text>
        </View>
      )}

      <Text style={styles.title}>
        {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
      </Text>

      <View style={styles.toggleContainer}>
        <Text style={[styles.toggleText, !isTeacher && styles.toggleActive]}>
          Estudiante
        </Text>
        <Switch
          value={isTeacher}
          onValueChange={setIsTeacher}
          trackColor={{ false: '#007AFF', true: '#34C759' }}
          thumbColor="#fff"
        />
        <Text style={[styles.toggleText, isTeacher && styles.toggleActive]}>
          Profesor
        </Text>
      </View>

      <View style={styles.formContainer}>
        {isRegister && (
          <>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre"
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Apellido"
              autoCapitalize="words"
            />
          </>
        )}
        
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          secureTextEntry
        />

        {isRegister && (
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmar Contraseña"
            secureTextEntry
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.switchButton}
        onPress={() => setIsRegister(!isRegister)}
      >
        <Text style={styles.switchButtonText}>
          {isRegister 
            ? '¿Ya tienes cuenta? Inicia sesión' 
            : '¿No tienes cuenta? Registrarse'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
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
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileIconText: {
    fontSize: 40,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileInitials: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitialsText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  cameraIconText: {
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
  },
  toggleActive: {
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
  },
  switchButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  backButton: {
    marginTop: 30,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
