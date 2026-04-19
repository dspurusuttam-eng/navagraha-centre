import { buildPageMetadata } from "@/lib/metadata";
import { AuthFormShell } from "@/modules/auth/components/auth-form-shell";
import { SignUpForm } from "@/modules/auth/components/sign-up-form";

export const metadata = buildPageMetadata({
  title: "Create Account",
  description:
    "Create a private NAVAGRAHA CENTRE account for your protected dashboard and profile foundation.",
  path: "/sign-up",
  keywords: ["NAVAGRAHA CENTRE create account", "astrology member signup"],
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

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const callbackUrl = sanitizeNextPath(resolvedSearchParams?.next);
  const intent = readSingleValue(resolvedSearchParams?.intent) ?? null;
  const signInHref = intent
    ? `/sign-in?intent=${encodeURIComponent(intent)}&next=${encodeURIComponent(callbackUrl)}`
    : `/sign-in?next=${encodeURIComponent(callbackUrl)}`;

  return (
    <AuthFormShell
      eyebrow="Member Foundation"
      title="Create your protected NAVAGRAHA CENTRE account."
      description="Open your private workspace now so future consultations, chart records, remedies, orders, and editorial access can live in one calm, secure account foundation."
      highlights={[
        "Email-and-password access powered by a self-hosted authentication layer.",
        "A seed-ready user profile prepared for later astrology and commerce modules.",
        "A private dashboard shell designed for future premium member journeys.",
      ]}
      alternateHref={signInHref}
      alternateLabel="Sign in instead"
    >
      <SignUpForm
        callbackUrl={callbackUrl}
        intent={intent}
        signInHref={signInHref}
      />
    </AuthFormShell>
  );
}
