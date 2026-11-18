import type { ErreurApi } from "./client";

// Aide pour les tests : attend qu'un appel échoue et renvoie son erreur typée
export async function echec(promesse: Promise<unknown>): Promise<ErreurApi> {
  try {
    await promesse;
  } catch (e) {
    return e as ErreurApi;
  }
  throw new Error("L'appel aurait dû échouer");
}
