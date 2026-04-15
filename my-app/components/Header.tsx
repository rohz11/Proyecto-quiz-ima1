import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { getInitials } from '@/utils';
import { HeaderProps } from '@/types/components';

export const Header: React.FC<HeaderProps> = ({
  showBackButton = false,
  onBackPress,
  showProfile = false,
  profileImage,
  profileName,
  profileLastName,
  onProfilePress,
}) => {

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress || router.back} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.appName}>QUIZIMA</Text>
      </View>
      
      {showProfile && (
        <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profilePlaceholderText}>{getInitials(profileName, profileLastName)}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePlaceholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
