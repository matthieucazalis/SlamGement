import { router, useLocalSearchParams } from "expo-router";
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
import { ChampTexte } from "@/components/ChampTexte";
import { Texte } from "@/components/Texte";
import { useAuth } from "@/context/auth";
import { usePreferences } from "@/context/preferences";
import { validerNouvelAdr } from "@/data/regles";
import { useStockage } from "@/hooks/useStockage";

type Brouillon = {
  title: string;
  context: string;
  decision: string;
  consequences: string;
  alternatives: string;
};
const VIDE: Brouillon = {
  title: "",
  context: "",
  decision: "",
  consequences: "",
  alternatives: "",
};

// Le contenu du stockage n'est jamais cru : on vérifie sa forme
const estBrouillon = (v: unknown): v is Brouillon =>
  !!v &&
  typeof v === "object" &&
  (Object.keys(VIDE) as (keyof Brouillon)[]).every(
    (k) => typeof (v as Record<string, unknown>)[k] === "string",
  );

const aDuContenu = (b: Brouillon) =>
  Object.values(b).some((v) => v.trim() !== "");

// Écran 6 : saisie d'un nouvel ADR. Ce qu'on tape est enregistré sur le téléphone
// (AsyncStorage) : si on ferme l'appli en plein milieu, on le retrouve.
export default function EcranNouvelAdr() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, couleurs, vibrer } = usePreferences();
  const { api } = useAuth();

  const [valeurs, setValeurs, charge, effacerBrouillon] =
    useStockage<Brouillon>(`brouillon.adr.${id}`, VIDE, estBrouillon);
  const [aEdite, setAEdite] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [invalides, setInvalides] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const brouillonRestaure = charge && !aEdite && aDuContenu(valeurs);

  const modifier = (champ: keyof Brouillon) => (texte: string) => {
    setAEdite(true);
    setValeurs((actuel) => ({ ...actuel, [champ]: texte }));
    if (invalides.includes(champ))
      setInvalides((l) => l.filter((c) => c !== champ));
  };

  async function creer() {
    setMessage(null);
    // validation côté téléphone (mêmes minimums que le site) pour répondre tout de suite
    const manquants = validerNouvelAdr(valeurs);
    if (manquants.length > 0) {
      setInvalides(manquants);
      setMessage(t("nouvelAdr.minimum"));
      vibrer("erreur");
      return;
    }

    setEnCours(true);
    try {
      const cree = await api.creerAdr(id, {
        title: valeurs.title.trim(),
        context: valeurs.context.trim(),
        decision: valeurs.decision.trim(),
        consequences: valeurs.consequences.trim(),
        ...(valeurs.alternatives.trim()
          ? { alternatives: valeurs.alternatives.trim() }
          : {}),
      });
      effacerBrouillon();
      vibrer("succes");
      router.replace({
        pathname: "/projet/[id]/adr/[numero]",
        params: { id, numero: String(cree.number) },
      });
    } catch (e) {
      vibrer("erreur");
      if (e instanceof ErreurApi && e.code === "validation")
        setInvalides(e.champs);
      setMessage(t(`erreurs.${e instanceof ErreurApi ? e.code : "inconnue"}`));
    } finally {
      setEnCours(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenu}
        keyboardShouldPersistTaps="handled"
      >
        {brouillonRestaure ? (
          <View
            style={[styles.bandeau, { backgroundColor: couleurs.carteActive }]}
          >
            <Texte
              variante="doux"
              accessibilityRole="alert"
              style={{ flex: 1 }}
            >
              {t("nouvelAdr.brouillon")}
            </Texte>
            <Bouton
              titre={t("commun.effacer")}
              variante="discret"
              onPress={effacerBrouillon}
            />
          </View>
        ) : null}

        <ChampTexte
          etiquette={t("nouvelAdr.champTitre")}
          value={valeurs.title}
          onChangeText={modifier("title")}
          erreur={invalides.includes("title")}
        />
        <ChampTexte
          etiquette={t("nouvelAdr.contexte")}
          value={valeurs.context}
          onChangeText={modifier("context")}
          multiline
          erreur={invalides.includes("context")}
        />
        <ChampTexte
          etiquette={t("nouvelAdr.decision")}
          value={valeurs.decision}
          onChangeText={modifier("decision")}
          multiline
          erreur={invalides.includes("decision")}
        />
        <ChampTexte
          etiquette={t("nouvelAdr.consequences")}
          value={valeurs.consequences}
          onChangeText={modifier("consequences")}
          multiline
          erreur={invalides.includes("consequences")}
        />
        <ChampTexte
          etiquette={t("nouvelAdr.alternatives")}
          value={valeurs.alternatives}
          onChangeText={modifier("alternatives")}
          multiline
        />

        {message ? (
          <Texte accessibilityRole="alert" style={{ color: couleurs.danger }}>
            {message}
          </Texte>
        ) : null}
        <Bouton
          titre={enCours ? t("nouvelAdr.enCours") : t("nouvelAdr.creer")}
          onPress={creer}
          enCours={enCours}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: 16, gap: 16 },
  bandeau: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
});
