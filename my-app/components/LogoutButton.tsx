import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { LogoutButtonProps } from '@/types/components';

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  onPress, 
  style,
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      <Ionicons name="log-out" size={20} color={Colors.danger} />
      <Text style={styles.buttonText}>Cerrar Sesión</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
    gap: 8,
    marginTop: 20,
  },
  buttonText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
