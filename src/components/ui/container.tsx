import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Container({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 max-w-[var(--container-max)] px-4 sm:px-8 lg:px-10",
        className
      )}
      {...props}
    />
  );
}
