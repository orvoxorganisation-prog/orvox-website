"use client";

import * as React from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Native share with clipboard fallback + toast confirmation. */
export function ShareButton({
  title,
  text,
  className,
}: {
  title: string;
  text?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user dismissed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied", { description: "Share it with your partner." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      className={cn(
        "press inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-ink-200 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/5 hover:text-canvas",
        className,
      )}
    >
      {copied ? <Check className="h-4 w-4 text-success" strokeWidth={2} /> : <Share2 className="h-4 w-4" strokeWidth={1.75} />}
      Share
    </button>
  );
}
