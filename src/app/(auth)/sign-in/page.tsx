import { buildPageMetadata } from "@/lib/metadata";
import { AuthFormShell } from "@/modules/auth/components/auth-form-shell";
import { SignInForm } from "@/modules/auth/components/sign-in-form";

export const metadata = buildPageMetadata({
  title: "Account Access",
  description:
    "Sign in to access your NAVAGRAHA CENTRE account, saved Kundli, and consultation support.",
  path: "/sign-in",
  keywords: [
    "NAVAGRAHA CENTRE account access",
    "astrology member login",
    "protected sign in",
  ],
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
      eyebrow="Protected Access"
      title="Account Access"
      description="Sign in to access your NAVAGRAHA CENTRE account, saved Kundli, and consultation support."
      highlights={[
        "Account",
        "Consultation",
        "Saved Kundli",
        "Secure entry",
      ]}
      alternateHref={signUpHref}
      alternateLabel="Create an account"
    >
      <SignInForm
        callbackUrl={callbackUrl}
        signUpHref={signUpHref}
        title="Secure Account Entry"
        description="Use email and password to continue to the protected account area."
        safetyNote="Your account area is protected. Personal details, saved Kundli, and consultation access stay behind secure sign-in."
        supportLinks={[
          { label: "Home", href: "/" },
          { label: "Desk", href: "/from-the-desk" },
          { label: "Consultation", href: "/consultation" },
          { label: "Support", href: "/support" },
        ]}
      />
    </AuthFormShell>
  );
}
