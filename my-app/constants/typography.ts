import { TextStyle } from 'react-native';

export const Typography = {
  // Font family
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },

  // Common text styles
  textStyles: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    } as TextStyle,
    h2: {
      fontSize: 28,
      fontWeight: 'bold' as const,
      lineHeight: 36,
      letterSpacing: -0.5,
    } as TextStyle,
    h3: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      lineHeight: 32,
      letterSpacing: -0.5,
    } as TextStyle,
    h4: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      lineHeight: 28,
      letterSpacing: -0.5,
    } as TextStyle,
    bodyLarge: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 26,
    } as TextStyle,
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    } as TextStyle,
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    } as TextStyle,
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    } as TextStyle,
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    } as TextStyle,
    button: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      lineHeight: 24,
    } as TextStyle,
  },

  // Colors
  colors: {
    text: {
      primary: '#333333',
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#FFFFFF',
    },
  },
};

export default Typography;
