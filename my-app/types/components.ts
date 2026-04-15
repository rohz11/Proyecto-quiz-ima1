// Interfaces para componentes
import { ViewStyle, TextInputProps } from 'react-native';

export interface BadgeProps {
  text: string;
  variant?: 'success' | 'danger' | 'warning' | 'info';
}

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
}

export interface CardContentProps {
  children: React.ReactNode;
}

export interface CardActionsProps {
  children: React.ReactNode;
}

export interface DropdownOption {
  label: string;
  value: number;
}

export interface DropdownProps {
  options: DropdownOption[];
  selectedValue: number;
  onSelect: (value: number) => void;
  placeholder?: string;
}

export interface LogoutButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

export interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface QuizButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export interface QuizCardWithMenuProps {
  _id: string;
  titulo: string;
  tema?: string | null;
  cantidad_preguntas: number;
  fecha_creacion: string;
  imagen_portada?: string | null;
  size?: 'small' | 'medium' | 'large';
  onPresentar?: (id: string) => void;
  onEditar?: (id: string) => void;
  onEliminado?: () => void;
}

export interface QuizInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
}

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export interface HeaderProps {
  showBackButton?: boolean;
  onBackPress?: () => void;
  showProfile?: boolean;
  profileImage?: string | null;
  profileName?: string;
  profileLastName?: string;
  onProfilePress?: () => void;
}