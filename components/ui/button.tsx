import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "navy" | "danger";
  size?: "sm" | "md" | "lg";
};

export function buttonClass(variant: Props["variant"] = "primary") {
  if (variant === "secondary" || variant === "navy") return "btn btn-secondary";
  if (variant === "outline" || variant === "ghost") return "btn btn-outline";
  if (variant === "danger") return "btn btn-primary bg-red-700";
  return "btn btn-primary";
}

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <button
      className={cn(
        buttonClass(variant),
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "lg" && "px-6 py-3.5 text-base",
        className,
      )}
      {...props}
    />
  );
}
