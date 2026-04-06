"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { Button, type ButtonProps } from "@/components/ui/button";

export function SignOutButton(props: Readonly<ButtonProps>) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);

    try {
      await signOut();
      router.push("/");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      {...props}
      disabled={isPending || props.disabled}
      onClick={handleSignOut}
    >
      {isPending ? "Signing Out..." : "Sign Out"}
    </Button>
  );
}
