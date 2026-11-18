import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { usePreferences } from "@/context/preferences";
import { Texte } from "./Texte";

export function ChampTexte({
  etiquette,
  erreur,
  aide,
  style,
  ...props
}: TextInputProps & { etiquette: string; erreur?: boolean; aide?: string }) {
  const { couleurs } = usePreferences();
  return (
    <View style={styles.groupe}>
      <Texte variante="doux">{etiquette}</Texte>
      <TextInput
        accessibilityLabel={etiquette}
        placeholderTextColor={couleurs.texteDoux}
        {...props}
        style={[
          styles.champ,
          props.multiline && styles.multiligne,
          {
            color: couleurs.texte,
            backgroundColor: couleurs.champ,
            borderColor: erreur ? couleurs.danger : couleurs.bordure,
          },
          style,
        ]}
      />
      {aide ? <Texte variante="petit">{aide}</Texte> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  groupe: { gap: 6 },
  champ: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  multiligne: { minHeight: 110, paddingVertical: 10, textAlignVertical: "top" },
});
