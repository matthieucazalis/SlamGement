import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErreurApi } from "@/api/client";
import { BlocErreur, Chargement, Vide } from "@/components/Etats";
import { Icone } from "@/components/Icones";
import { Texte } from "@/components/Texte";
import { useAuth } from "@/context/auth";
import { usePreferences } from "@/context/preferences";
import type { Message } from "@/data/types";
import { useChargement } from "@/hooks/useChargement";

const TAILLE_MAX = 2000;
const ACTUALISATION_MS = 8000;

// Discussion d'un projet : les 50 derniers messages, texte seul. La liste est
// « inversée » (le plus récent en bas, qui reste en place quand on lit plus haut).
export default function EcranMessagerie() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, couleurs, langue, vibrer } = usePreferences();
  const { api, expirer } = useAuth();
  const marges = useSafeAreaInsets();

  const projet = useChargement(`projet-${id}`, () => api.projet(id));
  const etat = useChargement(`messages-${id}`, () => api.messages(id), {
    auFocus: true,
  });
  const { recharger } = etat;

  // La conversation se met à jour toute seule
  useEffect(() => {
    const minuteur = setInterval(() => void recharger(), ACTUALISATION_MS);
    return () => clearInterval(minuteur);
  }, [recharger]);

  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);

  const peutEnvoyer = texte.trim().length > 0 && !envoi;

  const envoyer = async () => {
    const corps = texte.trim();
    if (!corps || envoi) return;
    setEnvoi(true);
    setErreurEnvoi(null);
    try {
      await api.envoyerMessage(id, corps);
      vibrer("leger");
      setTexte("");
      await recharger();
    } catch (e) {
      const err = e instanceof ErreurApi ? e : new ErreurApi("inconnue");
      if (err.code === "non_authentifie") expirer();
      setErreurEnvoi(t(`erreurs.${err.code}`));
    } finally {
      setEnvoi(false);
    }
  };

  const titre = projet.donnees?.name ?? t("chat.titre");

  if (etat.chargement && !etat.donnees) {
    return (
      <>
        <Stack.Screen options={{ title: titre }} />
        <Chargement />
      </>
    );
  }
  if (etat.erreur && !etat.donnees) {
    return (
      <>
        <Stack.Screen options={{ title: titre }} />
        <BlocErreur erreur={etat.erreur} onReessayer={etat.recharger} />
      </>
    );
  }

  const messages = etat.donnees ?? [];
  // FlatList inversée : le premier élément s'affiche en bas
  const donneesInversees = [...messages].reverse();

  const heure = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString(langue, { day: "2-digit", month: "2-digit" })} · ${d.toLocaleTimeString(langue, { hour: "2-digit", minute: "2-digit" })}`;
  };

  const bulle = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.bulle,
        item.mine
          ? [styles.moi, { backgroundColor: couleurs.primaire }]
          : [
              styles.autre,
              { backgroundColor: couleurs.carte, borderColor: couleurs.bordure },
            ],
      ]}
    >
      <Texte
        variante="petit"
        style={{
          color: item.mine ? couleurs.surPrimaire : couleurs.texteDoux,
          opacity: item.mine ? 0.8 : 1,
        }}
      >
        {item.mine ? "" : `${item.author.name} · `}
        {heure(item.createdAt)}
      </Texte>
      <Texte
        selectable
        style={{ color: item.mine ? couleurs.surPrimaire : couleurs.texte }}
      >
        {item.body}
      </Texte>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.ecran, { backgroundColor: couleurs.fond }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen options={{ title: titre }} />

      <View
        style={[
          styles.bandeau,
          { backgroundColor: couleurs.carte, borderColor: couleurs.bordure },
        ]}
      >
        <Texte variante="petit" style={styles.bandeauTexte}>
          {t("chat.limite")}
        </Texte>
        <Texte variante="petit" style={{ fontWeight: "600" }}>
          {messages.length} / 50
        </Texte>
      </View>

      {messages.length === 0 ? (
        <Vide texte={t("chat.vide")} />
      ) : (
        <FlatList
          inverted
          data={donneesInversees}
          keyExtractor={(m) => m.id}
          renderItem={bulle}
          contentContainerStyle={styles.liste}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {erreurEnvoi || etat.erreur ? (
        <Texte
          variante="petit"
          accessibilityRole="alert"
          style={[styles.erreur, { color: couleurs.danger }]}
        >
          {erreurEnvoi ?? t(`erreurs.${etat.erreur!.code}`)}
        </Texte>
      ) : null}

      <View
        style={[
          styles.saisie,
          {
            backgroundColor: couleurs.carte,
            borderColor: couleurs.bordure,
            paddingBottom: Math.max(marges.bottom, 8),
          },
        ]}
      >
        <TextInput
          value={texte}
          onChangeText={setTexte}
          placeholder={t("chat.placeholder")}
          placeholderTextColor={couleurs.texteDoux}
          multiline
          maxLength={TAILLE_MAX}
          accessibilityLabel={t("chat.placeholder")}
          style={[
            styles.champ,
            {
              backgroundColor: couleurs.champ,
              borderColor: couleurs.bordure,
              color: couleurs.texte,
            },
          ]}
        />
        <Pressable
          onPress={envoyer}
          disabled={!peutEnvoyer}
          accessibilityRole="button"
          accessibilityLabel={t("chat.envoyer")}
          style={[
            styles.envoyer,
            { backgroundColor: couleurs.primaire, opacity: peutEnvoyer ? 1 : 0.4 },
          ]}
        >
          <Icone nom="envoyer" taille={22} couleur={couleurs.surPrimaire} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1 },
  bandeau: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bandeauTexte: { flex: 1 },
  liste: { padding: 12, gap: 8 },
  bulle: {
    maxWidth: "85%",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  moi: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  autre: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  erreur: { paddingHorizontal: 14, paddingVertical: 4 },
  saisie: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  champ: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 16,
  },
  envoyer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
