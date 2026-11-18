import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ErreurApi } from "@/api/client";
import { Bouton } from "@/components/Bouton";
import { Choix } from "@/components/Choix";
import { ChampTexte } from "@/components/ChampTexte";
import { Texte } from "@/components/Texte";
import { useAuth } from "@/context/auth";
import { usePreferences } from "@/context/preferences";
import { LANGUES, NOMS_LANGUES } from "@/i18n";

export default function EcranConnexion() {
  const { t, couleurs, langue, changerLangue, vibrer } = usePreferences();
  const { serveur, connecter } = useAuth();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function valider() {
    setMessage(null);
    if (!email.trim() || !motDePasse)
      return setMessage(t("connexion.champsRequis"));

    setEnCours(true);
    try {
      // le serveur est choisi une fois pour toutes (variable EXPO_PUBLIC_API_URL)
      await connecter(serveur, email, motDePasse);
      vibrer("succes");
      // la navigation se fait toute seule : Stack.Protected change d'écran dès que le jeton existe
    } catch (e) {
      vibrer("erreur");
      const code = e instanceof ErreurApi ? e.code : "inconnue";
      setMessage(t(`erreurs.${code}`));
    } finally {
      setEnCours(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: couleurs.fond }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenu}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.entete}>
          <Texte variante="titre">SlamGement</Texte>
          <Texte variante="doux">{t("connexion.sousTitre")}</Texte>
        </View>

        <ChampTexte
          etiquette={t("connexion.email")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="username"
        />
        <ChampTexte
          etiquette={t("connexion.motDePasse")}
          value={motDePasse}
          onChangeText={setMotDePasse}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          onSubmitEditing={valider}
        />

        {message ? (
          <Texte accessibilityRole="alert" style={{ color: couleurs.danger }}>
            {message}
          </Texte>
        ) : null}

        <Bouton
          titre={enCours ? t("connexion.enCours") : t("connexion.seConnecter")}
          onPress={valider}
          enCours={enCours}
        />

        <View style={styles.langues}>
          <Choix
            etiquette={t("profil.langue")}
            options={LANGUES.map((l) => ({
              valeur: l,
              titre: NOMS_LANGUES[l],
            }))}
            valeur={langue}
            onChange={changerLangue}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: 24, paddingTop: 80, gap: 16 },
  entete: { gap: 4, marginBottom: 8 },
  langues: { marginTop: 8 },
});
