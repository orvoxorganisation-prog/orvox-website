"use client";

import * as React from "react";
import Link from "next/link";

/**
 * Lightweight cookie/privacy notice. ORVOX only sets strictly-necessary cookies
 * (session + saved registrations), so this is an acknowledgement notice rather
 * than a tracking opt-in. The dismissal is stored in localStorage (not a cookie)
 * so showing the notice never itself sets state the user hasn't seen.
 */
const KEY = "orvox_cookie_ack";

export function CookieConsent() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* storage blocked — don't nag */
    }
  }, []);

  if (!show) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-2xl rounded-2xl bg-surface-2/95 p-4 text-sm text-ink-200 ring-1 ring-inset ring-white/12 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.6)] backdrop-blur-md sm:flex sm:items-center sm:gap-4"
    >
      <p className="flex-1 leading-relaxed">
        We use only essential cookies to keep you signed in and remember your registrations. See our{" "}
        <Link href="/privacy" className="font-medium text-canvas underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={accept}
        className="press mt-3 inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-canvas px-5 text-[13px] font-medium text-ink-900 transition-colors hover:bg-ink-100 sm:mt-0"
      >
        Got it
      </button>
    </div>
  );
}
