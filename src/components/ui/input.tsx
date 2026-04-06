import type { InputHTMLAttributes } from "react";
import { fieldStyles } from "@/components/ui/field";

export function Input({
  className,
  type = "text",
  ...props
}: Readonly<InputHTMLAttributes<HTMLInputElement>>) {
  return <input className={fieldStyles(className)} type={type} {...props} />;
}
