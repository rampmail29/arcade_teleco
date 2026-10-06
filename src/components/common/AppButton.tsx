import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export default function AppButton({ title, onPress, variant = 'primary', style }: Props) {
  const variantStyle = {
    primary: { bg: '#1A0D30', border: '#A855F7', color: '#A855F7' },
    secondary: { bg: '#0D0D22', border: '#2A2A4A', color: '#FFF' },
    danger: { bg: '#1A0710', border: '#7C2020', color: '#EC4899' },
  }[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: variantStyle.bg, borderColor: variantStyle.border },
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.txt, { color: variantStyle.color }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center' },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.85 },
  txt: { fontSize: 12, fontWeight: '900', letterSpacing: 3 },
});