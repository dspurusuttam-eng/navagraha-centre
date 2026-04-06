import type { CSSProperties, SelectHTMLAttributes } from "react";
import { fieldStyles } from "@/components/ui/field";

const selectArrowStyle: CSSProperties = {
  backgroundImage:
    'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 16 16%27 fill=%27none%27%3E%3Cpath d=%27M4 6L8 10L12 6%27 stroke=%27%23d7bb83%27 stroke-width=%271.4%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E")',
  backgroundPosition: "right 1rem center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "1rem 1rem",
};

export function Select({
  className,
  children,
  ...props
}: Readonly<SelectHTMLAttributes<HTMLSelectElement>>) {
  return (
    <select
      className={fieldStyles(`appearance-none pr-12 ${className ?? ""}`)}
      style={selectArrowStyle}
      {...props}
    >
      {children}
    </select>
  );
}
