import type { TextareaHTMLAttributes } from "react";
import { fieldStyles } from "@/components/ui/field";

export function Textarea({
  className,
  rows = 5,
  ...props
}: Readonly<TextareaHTMLAttributes<HTMLTextAreaElement>>) {
  return (
    <textarea
      className={fieldStyles(
        `min-h-36 resize-y leading-[var(--line-height-copy)] ${className ?? ""}`
      )}
      rows={rows}
      {...props}
    />
  );
}
