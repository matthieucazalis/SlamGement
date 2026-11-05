export const ROLE_LABELS = {
  ADMIN: "Administrateur",
  MEMBER: "Membre",
} as const;

export type RoleValue = keyof typeof ROLE_LABELS;

export function roleLabel(role: RoleValue) {
  return ROLE_LABELS[role];
}
