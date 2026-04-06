export const preferredLanguageOptions = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "as", label: "Assamese" },
  { value: "bn", label: "Bengali" },
] as const;

export type PreferredLanguage =
  (typeof preferredLanguageOptions)[number]["value"];

export const defaultPreferredLanguage: PreferredLanguage = "en";

export function isPreferredLanguage(value: string): value is PreferredLanguage {
  return preferredLanguageOptions.some((option) => option.value === value);
}

export function getPreferredLanguageLabel(value: string | null | undefined) {
  return (
    preferredLanguageOptions.find((option) => option.value === value)?.label ??
    preferredLanguageOptions.find(
      (option) => option.value === defaultPreferredLanguage
    )?.label ??
    "English"
  );
}
