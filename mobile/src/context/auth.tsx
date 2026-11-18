import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import { normaliserAdresse } from "@/api/adresse";
import { adresseParDefaut } from "@/api/serveur";
import { connexion, creerApi, ErreurApi, type Api } from "@/api/client";
import type { Utilisateur } from "@/data/types";
import { ecrireSecret, lireSecret, supprimerSecret } from "@/lib/secret";

const CLE_JETON = "slamgement.jeton";
const CLE_SERVEUR = "slamgement.serveur";

type Valeur = {
  pret: boolean; // lecture du jeton terminée
  serveur: string;
  jeton: string | null;
  utilisateur: Utilisateur | null;
  api: Api;
  connecter: (
    serveur: string,
    email: string,
    motDePasse: string,
  ) => Promise<void>;
  deconnecter: () => Promise<void>;
  // appelée quand le serveur répond 401 : on oublie le jeton
  expirer: () => void;
  rafraichirUtilisateur: () => Promise<void>;
};

const Contexte = createContext<Valeur | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [pret, setPret] = useState(false);
  const [serveur, setServeur] = useState(adresseParDefaut());
  const [jeton, setJeton] = useState<string | null>(null);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);

  const api = useMemo(() => creerApi(serveur, jeton), [serveur, jeton]);

  const oublier = useCallback(() => {
    setJeton(null);
    setUtilisateur(null);
    supprimerSecret(CLE_JETON).catch(() => undefined);
  }, []);

  // Au démarrage : on relit le serveur (AsyncStorage) et le jeton (coffre sécurisé)
  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const [serveurEnregistre, jetonEnregistre] = await Promise.all([
          AsyncStorage.getItem(CLE_SERVEUR),
          lireSecret(CLE_JETON),
        ]);
        if (annule) return;
        if (serveurEnregistre) setServeur(serveurEnregistre);
        if (jetonEnregistre) setJeton(jetonEnregistre);
      } finally {
        if (!annule) setPret(true);
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  const rafraichirUtilisateur = useCallback(async () => {
    if (!jeton) return;
    try {
      setUtilisateur(await api.moi());
    } catch (e) {
      if (e instanceof ErreurApi && e.code === "non_authentifie") oublier();
      // une panne réseau n'efface pas la session
    }
  }, [api, jeton, oublier]);

  // Une fois le jeton relu, on récupère le profil (nom, photo) auprès du serveur
  useEffect(() => {
    if (!pret || !jeton) return;
    let annule = false;
    api
      .moi()
      .then((moi) => {
        if (!annule) setUtilisateur(moi);
      })
      .catch((e) => {
        // une panne réseau n'efface pas la session ; un 401, si
        if (!annule && e instanceof ErreurApi && e.code === "non_authentifie")
          oublier();
      });
    return () => {
      annule = true;
    };
  }, [pret, jeton, api, oublier]);

  const connecter = useCallback(
    async (adresse: string, email: string, motDePasse: string) => {
      const propre = normaliserAdresse(adresse);
      if (!propre) throw new ErreurApi("validation");
      const nomAppareil = `Mobile (${Platform.OS})`;
      const reponse = await connexion(
        propre,
        email.trim(),
        motDePasse,
        nomAppareil,
      );
      await Promise.all([
        ecrireSecret(CLE_JETON, reponse.token),
        AsyncStorage.setItem(CLE_SERVEUR, propre),
      ]);
      setServeur(propre);
      setUtilisateur(reponse.user);
      setJeton(reponse.token);
    },
    [],
  );

  const deconnecter = useCallback(async () => {
    // le jeton est révoqué côté serveur ; si le réseau est coupé, on l'oublie quand même ici
    await api.deconnexion().catch(() => undefined);
    oublier();
  }, [api, oublier]);

  const valeur: Valeur = {
    pret,
    serveur,
    jeton,
    utilisateur,
    api,
    connecter,
    deconnecter,
    expirer: oublier,
    rafraichirUtilisateur,
  };
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useAuth() {
  const valeur = useContext(Contexte);
  if (!valeur) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return valeur;
}
