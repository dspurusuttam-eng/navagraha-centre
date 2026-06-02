import { buildPageMetadata } from "@/lib/metadata";
import { AuthFormShell } from "@/modules/auth/components/auth-form-shell";
import { SignInForm } from "@/modules/auth/components/sign-in-form";

export const metadata = buildPageMetadata({
  title: "Account Access",
  description:
    "Sign in to access your NAVAGRAHA CENTRE account, saved guidance, reports, and consultation support.",
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
      description="Sign in to access your NAVAGRAHA CENTRE account, saved guidance, reports, and consultation support."
      highlights={[
        "Saved Reports",
        "Consultation Support",
        "Learning Access",
        "Secure Account Entry",
      ]}
      alternateHref={signUpHref}
      alternateLabel="Create an account"
    >
      <SignInForm
        callbackUrl={callbackUrl}
        signUpHref={signUpHref}
        title="Secure Account Entry"
        description="Use your email and password to continue to the protected account area. Your account area is protected, and personal details, saved reports, and dashboard features should only be accessed after secure sign-in."
        safetyNote="Your account area is protected. Personal details, saved reports, and dashboard features should only be accessed after secure sign-in."
        supportLinks={[
          { label: "Ask NI", href: "/ai" },
          { label: "Home", href: "/" },
          { label: "Consultation", href: "/consultation" },
          { label: "Reports", href: "/reports" },
          { label: "Learn", href: "/articles" },
        ]}
      />
    </AuthFormShell>
  );
}
