// Garantit que l'anglais et l'allemand ont exactement les mêmes clés que le
// français : une traduction oubliée est une erreur de compilation.
export type DeepStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]>;
};
