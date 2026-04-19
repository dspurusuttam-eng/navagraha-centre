import { buildPageMetadata } from "@/lib/metadata";
import { AuthFormShell } from "@/modules/auth/components/auth-form-shell";
import { SignInForm } from "@/modules/auth/components/sign-in-form";

export const metadata = buildPageMetadata({
  title: "Sign In",
  description:
    "Access the NAVAGRAHA CENTRE private dashboard and account settings foundation.",
  path: "/sign-in",
  keywords: ["NAVAGRAHA CENTRE sign in", "astrology member login"],
});

type SearchParams = Promise<{
  next?: string | string[];
  intent?: string | string[];
}>;

function readSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeNextPath(value?: string | string[]) {
  const nextPath = readSingleValue(value);

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const callbackUrl = sanitizeNextPath(resolvedSearchParams?.next);
  const intent = readSingleValue(resolvedSearchParams?.intent) ?? null;
  const signUpHref = intent
    ? `/sign-up?intent=${encodeURIComponent(intent)}&next=${encodeURIComponent(callbackUrl)}`
    : `/sign-up?next=${encodeURIComponent(callbackUrl)}`;

  return (
    <AuthFormShell
      eyebrow="Private Access"
      title="A refined member workspace begins here."
      description="Sign in to the protected NAVAGRAHA CENTRE dashboard foundation, where profile settings, future charts, consultations, and orders will stay organized."
      highlights={[
        "Protected access to the private dashboard shell.",
        "A dedicated account profile prepared for later astrology and chart records.",
        "A clean foundation for consultation and commerce history.",
      ]}
      alternateHref={signUpHref}
      alternateLabel="Create an account"
    >
      <SignInForm callbackUrl={callbackUrl} signUpHref={signUpHref} />
    </AuthFormShell>
  );
}
