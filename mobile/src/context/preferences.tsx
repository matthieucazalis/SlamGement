import { getLocales } from "expo-localization";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { COULEURS, type Couleurs } from "@/constants/theme";
import { useStockage } from "@/hooks/useStockage";
import {
  creerTraducteur,
  estLangue,
  langueDepuisCode,
  type Langue,
  type Traducteur,
} from "@/i18n";
import { vibrer as vibrerBrut, type TypeVibration } from "@/lib/vibrations";

export type ChoixTheme = "clair" | "sombre" | "systeme";
const estTheme = (v: unknown): v is ChoixTheme =>
  v === "clair" || v === "sombre" || v === "systeme";

type Valeur = {
  langue: Langue;
  changerLangue: (langue: Langue) => void;
  t: Traducteur;
  theme: ChoixTheme;
  changerTheme: (theme: ChoixTheme) => void;
  schema: "clair" | "sombre"; // thème réellement affiché
  couleurs: Couleurs;
  vibrations: boolean;
  changerVibrations: (actives: boolean) => void;
  vibrer: (type: TypeVibration) => void;
  pretes: boolean;
};

const Contexte = createContext<Valeur | null>(null);

// Langue, thème et vibrations : enregistrés sur le téléphone (AsyncStorage)
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const langueAppareil = langueDepuisCode(getLocales()[0]?.languageCode);
  const [langue, changerLangue, langueChargee] = useStockage<Langue>(
    "preferences.langue",
    langueAppareil,
    estLangue,
  );
  const [theme, changerTheme, themeCharge] = useStockage<ChoixTheme>(
    "preferences.theme",
    "systeme",
    estTheme,
  );
  const [vibrations, changerVibrations, vibrationsChargees] =
    useStockage<boolean>(
      "preferences.vibrations",
      true,
      (v): v is boolean => typeof v === "boolean",
    );

  const systeme = useColorScheme();
  const schema: "clair" | "sombre" =
    theme === "systeme" ? (systeme === "dark" ? "sombre" : "clair") : theme;

  const t = useMemo(() => creerTraducteur(langue), [langue]);
  const vibrer = useCallback(
    (type: TypeVibration) => {
      if (vibrations) vibrerBrut(type);
    },
    [vibrations],
  );

  const valeur: Valeur = {
    langue,
    changerLangue,
    t,
    theme,
    changerTheme,
    schema,
    couleurs: COULEURS[schema],
    vibrations,
    changerVibrations,
    vibrer,
    pretes: langueChargee && themeCharge && vibrationsChargees,
  };

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function usePreferences() {
  const valeur = useContext(Contexte);
  if (!valeur)
    throw new Error(
      "usePreferences doit être utilisé dans <PreferencesProvider>",
    );
  return valeur;
}
