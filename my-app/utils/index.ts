import * as ImagePicker from 'expo-image-picker';

export const getInitials = (name?: string, lastName?: string): string => {
  const first = name?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return first + last || '👤';
};

export const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Se necesita permiso para acceder a la galería');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.3,
    base64: true,
  });

  if (!result.canceled && result.assets[0].base64) {
    return `data:image/jpeg;base64,${result.assets[0].base64}`;
  }
  return null;
};
