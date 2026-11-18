import { Tabs } from "expo-router/tabs";
import { Icone } from "@/components/Icones";
import { usePreferences } from "@/context/preferences";

// Quatre onglets : Projets, Favoris, Messages (une discussion par projet), Profil
export default function MiseEnPageOnglets() {
  const { t, couleurs } = usePreferences();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: couleurs.carte },
        headerTintColor: couleurs.texte,
        tabBarActiveTintColor: couleurs.primaire,
        tabBarInactiveTintColor: couleurs.texteDoux,
        tabBarStyle: {
          backgroundColor: couleurs.carte,
          borderTopColor: couleurs.bordure,
        },
        sceneStyle: { backgroundColor: couleurs.fond },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("onglets.projets"),
          headerTitle: t("projets.titre"),
          tabBarIcon: ({ color, size }) => (
            <Icone nom="projets" taille={size} couleur={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="favoris"
        options={{
          title: t("onglets.favoris"),
          headerTitle: t("favoris.titre"),
          tabBarIcon: ({ color, size }) => (
            <Icone nom="favori" taille={size} couleur={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t("onglets.messages"),
          headerTitle: t("chat.onglet"),
          tabBarIcon: ({ color, size }) => (
            <Icone nom="messages" taille={size} couleur={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: t("onglets.profil"),
          tabBarIcon: ({ color, size }) => (
            <Icone nom="profil" taille={size} couleur={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
