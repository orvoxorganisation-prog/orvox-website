"use client";

import { Toaster as Sonner } from "sonner";

/** Brand-tuned toast surface. Crisp, flat, pill-radius, mono meta. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-card !border !border-white/12 !bg-[#14171d] !shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] !font-sans !text-canvas",
          title: "!text-sm !font-semibold !tracking-tight",
          description: "!text-[13px] !text-ink-400",
          actionButton: "!rounded-full !bg-canvas !text-ink-900 !text-xs !font-medium",
          cancelButton: "!rounded-full !bg-white/10 !text-ink-300 !text-xs",
          success: "!text-success",
          error: "!text-danger",
        },
      }}
    />
  );
}
