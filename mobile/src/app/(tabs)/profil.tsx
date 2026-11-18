import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { ErreurApi } from "@/api/client";
import { Avatar } from "@/components/Avatar";
import { Bouton } from "@/components/Bouton";
import { Carte } from "@/components/Carte";
import { Choix } from "@/components/Choix";
import { Texte } from "@/components/Texte";
import { useAuth } from "@/context/auth";
import { usePreferences, type ChoixTheme } from "@/context/preferences";
import { LANGUES, NOMS_LANGUES } from "@/i18n";

// Mêmes options que dans le cours : images seulement, recadrage carré, qualité 0,5
const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.5,
};

type Message = { genre: "succes" | "erreur"; texte: string } | null;

// Écran 3 : mon profil. Photo (appareil photo ou galerie), préférences
// enregistrées sur le téléphone, déconnexion.
export default function EcranProfil() {
  const {
    t,
    couleurs,
    langue,
    changerLangue,
    theme,
    changerTheme,
    vibrations,
    changerVibrations,
    vibrer,
  } = usePreferences();
  const { utilisateur, api, rafraichirUtilisateur, deconnecter } =
    useAuth();
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function enregistrer(uri: string) {
    setEnCours(true);
    setMessage(null);
    try {
      // La photo du téléphone fait plusieurs Mo : on la réduit à 256 px avant l'envoi
      const contexte = ImageManipulator.manipulate(uri);
      contexte.resize({ width: 256, height: 256 });
      const image = await contexte.renderAsync();
      const resultat = await image.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.85,
        base64: true,
      });
      if (!resultat.base64) throw new ErreurApi("image");

      await api.envoyerPhoto(`data:image/jpeg;base64,${resultat.base64}`);
      await rafraichirUtilisateur();
      vibrer("succes"); // vibration « réussite » quand la photo est enregistrée
      setMessage({ genre: "succes", texte: t("profil.photoEnregistree") });
    } catch (e) {
      vibrer("erreur");
      const code = e instanceof ErreurApi ? e.code : "image";
      setMessage({ genre: "erreur", texte: t(`erreurs.${code}`) });
    } finally {
      setEnCours(false);
    }
  }

  async function prendrePhoto() {
    // On demande la permission au moment où on en a besoin, pas au démarrage
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      // Refusée : l'application continue de marcher, et on explique quoi faire
      Alert.alert(
        t("profil.permissionRefusee"),
        t("profil.permissionRefuseeTexte"),
        [
          { text: t("commun.annuler"), style: "cancel" },
          {
            text: t("profil.reglages"),
            onPress: () => void Linking.openSettings(),
          },
        ],
      );
      return;
    }
    const resultat = await ImagePicker.launchCameraAsync(OPTIONS);
    // Annuler n'est pas une erreur : on teste `canceled` avant de lire `assets`
    if (!resultat.canceled) await enregistrer(resultat.assets[0].uri);
  }

  async function choisirPhoto() {
    // Aucune permission pour la galerie : le sélecteur du système ne donne que l'image choisie
    const resultat = await ImagePicker.launchImageLibraryAsync(OPTIONS);
    if (!resultat.canceled) await enregistrer(resultat.assets[0].uri);
  }

  async function supprimerPhoto() {
    setEnCours(true);
    try {
      await api.supprimerPhoto();
      await rafraichirUtilisateur();
      setMessage({ genre: "succes", texte: t("profil.photoSupprimee") });
    } catch (e) {
      const code = e instanceof ErreurApi ? e.code : "inconnue";
      setMessage({ genre: "erreur", texte: t(`erreurs.${code}`) });
    } finally {
      setEnCours(false);
    }
  }

  function confirmerDeconnexion() {
    Alert.alert(t("profil.deconnexion"), t("profil.deconnexionConfirmation"), [
      { text: t("commun.annuler"), style: "cancel" },
      {
        text: t("profil.deconnexion"),
        style: "destructive",
        onPress: () => void deconnecter(),
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.contenu}>
      <View style={styles.identite}>
        <Avatar
          nom={utilisateur?.name ?? ""}
          source={utilisateur?.avatar}
          taille={160}
        />
        <Texte variante="titre">{utilisateur?.name}</Texte>
        <Texte variante="doux">{utilisateur?.email}</Texte>
      </View>

      <Carte>
        <Texte variante="sousTitre">{t("profil.photo")}</Texte>
        <View style={styles.rangee}>
          <Bouton
            titre={t("profil.appareilPhoto")}
            variante="secondaire"
            onPress={prendrePhoto}
            desactive={enCours}
            style={styles.moitie}
          />
          <Bouton
            titre={t("profil.galerie")}
            variante="secondaire"
            onPress={choisirPhoto}
            desactive={enCours}
            style={styles.moitie}
          />
        </View>
        {utilisateur?.avatar ? (
          <Bouton
            titre={t("profil.supprimerPhoto")}
            variante="discret"
            onPress={supprimerPhoto}
            desactive={enCours}
          />
        ) : null}
        {message ? (
          <Texte
            accessibilityRole={message.genre === "erreur" ? "alert" : undefined}
            style={{
              color:
                message.genre === "erreur" ? couleurs.danger : couleurs.succes,
            }}
          >
            {message.texte}
          </Texte>
        ) : null}
      </Carte>

      <Carte>
        <Texte variante="sousTitre">{t("profil.langue")}</Texte>
        <Choix
          etiquette={t("profil.langue")}
          options={LANGUES.map((l) => ({ valeur: l, titre: NOMS_LANGUES[l] }))}
          valeur={langue}
          onChange={changerLangue}
        />
      </Carte>

      <Carte>
        <Texte variante="sousTitre">{t("profil.apparence")}</Texte>
        <Choix<ChoixTheme>
          etiquette={t("profil.apparence")}
          options={[
            { valeur: "clair", titre: t("profil.clair") },
            { valeur: "sombre", titre: t("profil.sombre") },
            { valeur: "systeme", titre: t("profil.systeme") },
          ]}
          valeur={theme}
          onChange={changerTheme}
        />
      </Carte>

      <Carte>
        <View style={styles.rangeeEntre}>
          <View style={{ flex: 1 }}>
            <Texte variante="sousTitre">{t("profil.vibrations")}</Texte>
            <Texte variante="doux">{t("profil.vibrationsAide")}</Texte>
          </View>
          <Switch
            value={vibrations}
            onValueChange={changerVibrations}
            accessibilityLabel={t("profil.vibrations")}
            trackColor={{ true: couleurs.primaire }}
          />
        </View>
      </Carte>

      <Bouton
        titre={t("profil.deconnexion")}
        variante="danger"
        onPress={confirmerDeconnexion}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: 16, gap: 16 },
  identite: { alignItems: "center", gap: 6, paddingVertical: 8 },
  rangee: { flexDirection: "row", gap: 10 },
  moitie: { flex: 1 },
  rangeeEntre: { flexDirection: "row", alignItems: "center", gap: 12 },
});
