import { atom } from "recoil";

export const ThemeMode = {
  system: "system",
  dark: "dark",
  light: "light",
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ThemeMode = typeof ThemeMode[keyof typeof ThemeMode];

export const themeModeState = atom<ThemeMode>({
  key: "themeMode",
  default: ThemeMode.system,
});
