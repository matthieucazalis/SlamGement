import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Le jeton de connexion est un secret : sur téléphone il va dans le coffre
// sécurisé du système (Keychain iOS, Keystore Android), pas dans AsyncStorage
// (non chiffré). Le web n'a pas de coffre : repli sur AsyncStorage.
const natif = Platform.OS !== "web";

export const lireSecret = (cle: string) =>
  natif ? SecureStore.getItemAsync(cle) : AsyncStorage.getItem(cle);

export const ecrireSecret = (cle: string, valeur: string) =>
  natif
    ? SecureStore.setItemAsync(cle, valeur)
    : AsyncStorage.setItem(cle, valeur);

export const supprimerSecret = (cle: string) =>
  natif ? SecureStore.deleteItemAsync(cle) : AsyncStorage.removeItem(cle);
