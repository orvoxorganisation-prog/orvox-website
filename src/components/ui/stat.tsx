import { cn } from "@/lib/utils";

/**
 * Big mono stat — looks like a result, not marketing. Always tabular.
 * Value sits on top, tracked mono label beneath.
 */
export function Stat({
  value,
  label,
  size = "md",
  className,
  align = "left",
}: {
  value: React.ReactNode;
  label: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  className?: string;
}) {
  const valueSize = {
    sm: "text-2xl",
    md: "text-[2.75rem] leading-[0.95]",
    lg: "text-6xl leading-[0.9]",
  }[size];

  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <div className={cn("font-mono font-medium tabular [font-feature-settings:'tnum','zero'] tracking-tight", valueSize)}>
        {value}
      </div>
      <div className="eyebrow mt-2">{label}</div>
    </div>
  );
}
