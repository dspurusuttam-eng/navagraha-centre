export type OnboardingActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  redirectTo?: string;
};

export const initialOnboardingActionState: OnboardingActionState = {
  status: "idle",
};
