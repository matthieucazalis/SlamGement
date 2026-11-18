import type { DeepStrings } from "./types";

// Textes à relire et compléter par l'auteur du projet (les passages entre
// crochets sont des champs à renseigner avant la mise en ligne).
const fr = {
  footerPrivacy: "Confidentialité",
  footerNotice: "Mentions légales",
  back: "Retour",
  privacyTitle: "Politique de confidentialité",
  updated: "Dernière mise à jour : novembre 2026",
  s1Title: "Responsable du traitement",
  s1Text:
    "SlamGement est un projet réalisé dans le cadre du BTS SIO option SLAM. Responsable du traitement : [nom et prénom de l'auteur], contact : [adresse e-mail].",
  s2Title: "Données collectées",
  s2Text:
    "Nom, adresse e-mail et mot de passe (stocké uniquement sous forme d'empreinte bcrypt) ; photo de profil facultative ; préférences d'affichage (langue, thème, retour haptique) ; contenus que tu saisis dans les projets (décisions, tâches) ; historique des actions effectuées dans les projets ; compteurs techniques de tentatives de connexion.",
  s3Title: "Finalités et bases légales",
  s3Text:
    "Fournir le service de gestion de projet que tu as demandé (exécution du contrat), sécuriser les comptes et tracer les actions (intérêt légitime), conserver tes préférences. Aucune donnée n'est vendue, ni utilisée à des fins publicitaires, ni transmise à un tiers à des fins commerciales.",
  s4Title: "Durée de conservation",
  s4Text:
    "Les données du compte sont conservées tant que le compte existe. À la suppression du compte, ton nom, ton e-mail, ta photo et tes préférences sont effacés ; les décisions et l'historique des projets partagés sont conservés sous la mention « Utilisateur supprimé ». Les compteurs de connexion expirent après 15 minutes, les invitations après 7 jours et les liens de réinitialisation après 1 heure.",
  s5Title: "Tes droits",
  s5Text:
    "Tu peux à tout moment accéder à tes données, les rectifier, les exporter (format JSON) ou supprimer ton compte depuis la page Profil. Tu peux aussi t'adresser au responsable du traitement, et introduire une réclamation auprès de la CNIL (cnil.fr).",
  s6Title: "Cookies",
  s6Text:
    "SlamGement n'utilise que des cookies strictement nécessaires, qui ne demandent pas de consentement : le cookie de session (connexion) et les cookies de préférence (langue, thème, retour haptique). Aucun cookie de mesure d'audience ou de publicité.",
  s7Title: "Sécurité",
  s7Text:
    "Mots de passe hachés, connexion protégée contre les tentatives répétées, contrôle d'accès vérifié côté serveur, en-têtes de sécurité et transmission chiffrée (HTTPS) en production.",
  noticeTitle: "Mentions légales",
  n1Title: "Éditeur",
  n1Text:
    "[Nom et prénom de l'auteur], dans le cadre de la formation BTS SIO option SLAM, [établissement]. Contact : [adresse e-mail].",
  n2Title: "Hébergement",
  n2Text: "[Nom et adresse de l'hébergeur].",
  n3Title: "Nature du site",
  n3Text:
    "Application web réalisée à des fins pédagogiques. Elle n'est fournie sans aucune garantie de disponibilité et ne doit pas être utilisée pour stocker des informations sensibles.",
  n4Title: "Propriété intellectuelle",
  n4Text:
    "Le code et les contenus propres à l'application sont la propriété de leur auteur. Les contenus saisis par les utilisateurs restent leur propriété.",
};

const en: DeepStrings<typeof fr> = {
  footerPrivacy: "Privacy",
  footerNotice: "Legal notice",
  back: "Back",
  privacyTitle: "Privacy policy",
  updated: "Last updated: November 2026",
  s1Title: "Data controller",
  s1Text:
    "SlamGement is a project built for the BTS SIO (SLAM option) diploma. Data controller: [author's full name], contact: [email address].",
  s2Title: "Data collected",
  s2Text:
    "Name, email address and password (stored only as a bcrypt hash); optional profile picture; display preferences (language, theme, haptic feedback); content you enter in projects (decisions, tasks); history of actions performed in projects; technical counters of sign-in attempts.",
  s3Title: "Purposes and legal bases",
  s3Text:
    "To provide the project management service you asked for (performance of a contract), to secure accounts and trace actions (legitimate interest), and to keep your preferences. No data is sold, used for advertising or passed to a third party for commercial purposes.",
  s4Title: "Retention",
  s4Text:
    "Account data is kept as long as the account exists. When you delete your account, your name, email, picture and preferences are erased; decisions and history of shared projects are kept under the label “Deleted user”. Sign-in counters expire after 15 minutes, invitations after 7 days and reset links after 1 hour.",
  s5Title: "Your rights",
  s5Text:
    "You can at any time access your data, correct it, export it (JSON format) or delete your account from the Profile page. You can also contact the data controller and lodge a complaint with your data protection authority (in France, the CNIL: cnil.fr).",
  s6Title: "Cookies",
  s6Text:
    "SlamGement only uses strictly necessary cookies, which do not require consent: the session cookie (sign-in) and preference cookies (language, theme, haptic feedback). No analytics or advertising cookies.",
  s7Title: "Security",
  s7Text:
    "Hashed passwords, sign-in protected against repeated attempts, access control enforced on the server, security headers and encrypted transport (HTTPS) in production.",
  noticeTitle: "Legal notice",
  n1Title: "Publisher",
  n1Text:
    "[Author's full name], as part of the BTS SIO (SLAM option) programme, [school]. Contact: [email address].",
  n2Title: "Hosting",
  n2Text: "[Name and address of the host].",
  n3Title: "Nature of the site",
  n3Text:
    "Web application built for educational purposes. It is provided without any guarantee of availability and must not be used to store sensitive information.",
  n4Title: "Intellectual property",
  n4Text:
    "The code and content specific to the application belong to their author. Content entered by users remains their property.",
};

const de: DeepStrings<typeof fr> = {
  footerPrivacy: "Datenschutz",
  footerNotice: "Impressum",
  back: "Zurück",
  privacyTitle: "Datenschutzerklärung",
  updated: "Zuletzt aktualisiert: November 2026",
  s1Title: "Verantwortlicher",
  s1Text:
    "SlamGement ist ein Projekt im Rahmen des BTS SIO (Option SLAM). Verantwortlich: [vollständiger Name der Autorin / des Autors], Kontakt: [E-Mail-Adresse].",
  s2Title: "Erhobene Daten",
  s2Text:
    "Name, E-Mail-Adresse und Passwort (nur als bcrypt-Hash gespeichert); optionales Profilbild; Darstellungseinstellungen (Sprache, Design, haptisches Feedback); Inhalte, die du in Projekten eingibst (Entscheidungen, Aufgaben); Verlauf der in Projekten durchgeführten Aktionen; technische Zähler für Anmeldeversuche.",
  s3Title: "Zwecke und Rechtsgrundlagen",
  s3Text:
    "Bereitstellung des gewünschten Projektmanagement-Dienstes (Vertragserfüllung), Absicherung der Konten und Nachvollziehbarkeit von Aktionen (berechtigtes Interesse), Speicherung deiner Einstellungen. Es werden keine Daten verkauft, für Werbung genutzt oder zu kommerziellen Zwecken an Dritte weitergegeben.",
  s4Title: "Speicherdauer",
  s4Text:
    "Kontodaten werden gespeichert, solange das Konto besteht. Bei der Löschung deines Kontos werden Name, E-Mail-Adresse, Bild und Einstellungen gelöscht; Entscheidungen und Verlauf gemeinsamer Projekte bleiben unter der Bezeichnung „Gelöschter Benutzer“ erhalten. Anmeldezähler laufen nach 15 Minuten ab, Einladungen nach 7 Tagen und Zurücksetzungslinks nach 1 Stunde.",
  s5Title: "Deine Rechte",
  s5Text:
    "Du kannst jederzeit auf deine Daten zugreifen, sie berichtigen, exportieren (JSON-Format) oder dein Konto auf der Profilseite löschen. Du kannst dich außerdem an den Verantwortlichen wenden und dich bei deiner Datenschutzbehörde beschweren (in Frankreich: CNIL, cnil.fr).",
  s6Title: "Cookies",
  s6Text:
    "SlamGement verwendet nur unbedingt erforderliche Cookies, die keine Einwilligung erfordern: das Sitzungscookie (Anmeldung) und Einstellungscookies (Sprache, Design, haptisches Feedback). Keine Analyse- oder Werbe-Cookies.",
  s7Title: "Sicherheit",
  s7Text:
    "Gehashte Passwörter, Anmeldung mit Schutz vor wiederholten Versuchen, serverseitig erzwungene Zugriffskontrolle, Sicherheits-Header und verschlüsselte Übertragung (HTTPS) im Produktivbetrieb.",
  noticeTitle: "Impressum",
  n1Title: "Herausgeber",
  n1Text:
    "[Vollständiger Name der Autorin / des Autors], im Rahmen der Ausbildung BTS SIO (Option SLAM), [Schule]. Kontakt: [E-Mail-Adresse].",
  n2Title: "Hosting",
  n2Text: "[Name und Anschrift des Hosters].",
  n3Title: "Art der Website",
  n3Text:
    "Webanwendung für Ausbildungszwecke. Sie wird ohne Verfügbarkeitsgarantie bereitgestellt und darf nicht zur Speicherung sensibler Informationen verwendet werden.",
  n4Title: "Geistiges Eigentum",
  n4Text:
    "Der Code und die anwendungsspezifischen Inhalte gehören ihrem Autor. Von Nutzern eingegebene Inhalte bleiben deren Eigentum.",
};

export const legal = { fr, en, de };
