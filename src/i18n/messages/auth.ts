import type { DeepStrings } from "./types";

const fr = {
  loginTitle: "Connexion à SlamGement",
  registerTitle: "Créer un compte",
  email: "Email",
  password: "Mot de passe",
  name: "Nom",
  passwordHint: "8 caractères minimum.",
  login: "Se connecter",
  loggingIn: "Connexion...",
  register: "Créer mon compte",
  registering: "Création...",
  noAccount: "Pas de compte ?",
  createAccount: "Créer un compte",
  hasAccount: "Déjà un compte ?",
  registered: "Compte créé. Tu peux maintenant te connecter.",
  accountDeleted:
    "Ton compte a été supprimé. Tes données personnelles sont effacées.",
  forgotLink: "Mot de passe oublié ?",
  forgotTitle: "Mot de passe oublié",
  forgotHelp:
    "Saisis l'email de ton compte : si un compte existe, tu recevras un lien pour choisir un nouveau mot de passe.",
  forgotSubmit: "Envoyer le lien",
  forgotSending: "Envoi...",
  forgotSent:
    "Si un compte existe pour cette adresse, un e-mail vient d'être envoyé. Pense à vérifier tes courriers indésirables.",
  resetTitle: "Nouveau mot de passe",
  resetNewPassword: "Nouveau mot de passe",
  resetConfirm: "Confirmation",
  resetSubmit: "Changer le mot de passe",
  resetSaving: "Modification...",
  resetInvalid:
    "Ce lien est invalide, expiré ou déjà utilisé. Demande un nouveau lien.",
  resetRequestNew: "Demander un nouveau lien",
  resetDone: "Mot de passe modifié. Tu peux maintenant te connecter.",
  backToLogin: "Retour à la connexion",
  logout: "Se déconnecter",
};

const en: DeepStrings<typeof fr> = {
  loginTitle: "Sign in to SlamGement",
  registerTitle: "Create an account",
  email: "Email",
  password: "Password",
  name: "Name",
  passwordHint: "At least 8 characters.",
  login: "Sign in",
  loggingIn: "Signing in...",
  register: "Create my account",
  registering: "Creating...",
  noAccount: "No account yet?",
  createAccount: "Create an account",
  hasAccount: "Already have an account?",
  registered: "Account created. You can now sign in.",
  accountDeleted:
    "Your account has been deleted. Your personal data is erased.",
  forgotLink: "Forgot your password?",
  forgotTitle: "Forgot your password",
  forgotHelp:
    "Enter your account email: if an account exists, you will receive a link to choose a new password.",
  forgotSubmit: "Send the link",
  forgotSending: "Sending...",
  forgotSent:
    "If an account exists for this address, an email has just been sent. Remember to check your spam folder.",
  resetTitle: "New password",
  resetNewPassword: "New password",
  resetConfirm: "Confirmation",
  resetSubmit: "Change password",
  resetSaving: "Updating...",
  resetInvalid:
    "This link is invalid, expired or already used. Request a new link.",
  resetRequestNew: "Request a new link",
  resetDone: "Password changed. You can now sign in.",
  backToLogin: "Back to sign in",
  logout: "Sign out",
};

const de: DeepStrings<typeof fr> = {
  loginTitle: "Anmeldung bei SlamGement",
  registerTitle: "Konto erstellen",
  email: "E-Mail",
  password: "Passwort",
  name: "Name",
  passwordHint: "Mindestens 8 Zeichen.",
  login: "Anmelden",
  loggingIn: "Anmeldung...",
  register: "Mein Konto erstellen",
  registering: "Wird erstellt...",
  noAccount: "Noch kein Konto?",
  createAccount: "Konto erstellen",
  hasAccount: "Schon ein Konto?",
  registered: "Konto erstellt. Du kannst dich jetzt anmelden.",
  accountDeleted:
    "Dein Konto wurde gelöscht. Deine persönlichen Daten sind entfernt.",
  forgotLink: "Passwort vergessen?",
  forgotTitle: "Passwort vergessen",
  forgotHelp:
    "Gib die E-Mail-Adresse deines Kontos ein: Falls ein Konto existiert, erhältst du einen Link, um ein neues Passwort zu wählen.",
  forgotSubmit: "Link senden",
  forgotSending: "Wird gesendet...",
  forgotSent:
    "Falls für diese Adresse ein Konto existiert, wurde soeben eine E-Mail gesendet. Schau auch in deinen Spam-Ordner.",
  resetTitle: "Neues Passwort",
  resetNewPassword: "Neues Passwort",
  resetConfirm: "Bestätigung",
  resetSubmit: "Passwort ändern",
  resetSaving: "Wird geändert...",
  resetInvalid:
    "Dieser Link ist ungültig, abgelaufen oder wurde bereits verwendet. Fordere einen neuen Link an.",
  resetRequestNew: "Neuen Link anfordern",
  resetDone: "Passwort geändert. Du kannst dich jetzt anmelden.",
  backToLogin: "Zurück zur Anmeldung",
  logout: "Abmelden",
};

export const auth = { fr, en, de };
