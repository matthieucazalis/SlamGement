import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { usePreferences } from "@/context/preferences";

export function Carte({
  children,
  onPress,
  style,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const { couleurs } = usePreferences();
  const base = {
    backgroundColor: couleurs.carte,
    borderColor: couleurs.bordure,
  };

  if (!onPress)
    return <View style={[styles.carte, base, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.carte,
        base,
        pressed && { backgroundColor: couleurs.carteActive },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
});
