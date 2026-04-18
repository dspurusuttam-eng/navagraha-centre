import { buildPageMetadata } from "@/lib/metadata";
import { AuthFormShell } from "@/modules/auth/components/auth-form-shell";
import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
};

export const metadata = buildPageMetadata({
  title: "Reset Password",
  description:
    "Complete secure password reset for your NAVAGRAHA CENTRE account.",
  path: "/reset-password",
  keywords: ["NAVAGRAHA CENTRE reset password", "account security"],
});

export default async function ResetPasswordPage({
  searchParams,
}: Readonly<ResetPasswordPageProps>) {
  const params = await searchParams;
  const token = params.token?.trim() || null;
  const resetError = params.error?.trim() || null;

  return (
    <AuthFormShell
      eyebrow="Password Reset"
      title="Complete secure account recovery."
      description="Set a new password using your verified reset token."
      highlights={[
        "Reset links are validated server-side before password updates.",
        "Existing session security is preserved during recovery.",
        "The reset flow avoids exposing internal auth details.",
      ]}
      alternateHref="/forgot-password"
      alternateLabel="Request a new reset link"
    >
      <ResetPasswordForm token={token} resetError={resetError} />
    </AuthFormShell>
  );
}

