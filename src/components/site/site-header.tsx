"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { Magnetic } from "@/components/motion/magnetic";

const EASE = [0.32, 0.72, 0, 1] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => void (document.body.style.overflow = "");
  }, [open]);

  React.useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center">
      {/* Floating island */}
      <div
        className={cn(
          "glass-dark pointer-events-auto mt-4 flex items-center gap-1 rounded-full p-1.5 pl-4 transition-[box-shadow,background-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          scrolled ? "shadow-[0_18px_50px_-24px_rgba(0,0,0,0.85)]" : "shadow-none",
        )}
      >
        <Logo variant="stage" className="mr-1 text-[1rem]" />

        <span className="mx-1 hidden h-5 w-px bg-white/10 md:block" />

        <nav className="hidden items-center md:flex" aria-label="Primary">
          {mainNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200",
                  active ? "text-canvas" : "text-ink-300 hover:text-canvas",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-inset ring-white/10"
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <span className="mx-1 hidden h-5 w-px bg-white/10 md:block" />

        <Link
          href="/login"
          className="hidden rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink-300 transition-colors hover:text-canvas md:block"
        >
          Log in
        </Link>

        {/* Button-in-button CTA */}
        <Magnetic strength={0.3} className="hidden md:inline-flex">
          <Link
            href="/signup"
            className="group flex items-center gap-2 rounded-full bg-canvas py-1.5 pl-4 pr-1.5 text-[13px] font-semibold text-stage transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
          >
            Sign up
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
          </Link>
        </Magnetic>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="relative ml-1 flex h-9 w-9 items-center justify-center rounded-full md:hidden"
        >
          <motion.span
            className="absolute h-[1.5px] w-4 rounded-full bg-canvas"
            animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3 }}
            transition={{ duration: 0.3, ease: EASE }}
          />
          <motion.span
            className="absolute h-[1.5px] w-4 rounded-full bg-canvas"
            animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3 }}
            transition={{ duration: 0.3, ease: EASE }}
          />
        </button>
      </div>

      {/* Full-screen reveal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="pointer-events-auto fixed inset-0 z-[-1] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="void-mesh absolute inset-0 backdrop-blur-2xl" onClick={() => setOpen(false)} />
            <div className="relative flex h-full flex-col justify-center px-8">
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {mainNav.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduce ? 0 : 12 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.08 + i * 0.06 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block py-2 text-5xl font-bold tracking-tight transition-colors",
                        isActive(item.href) ? "text-canvas" : "text-ink-400 hover:text-canvas",
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                className="mt-12 flex flex-col gap-3"
                initial={{ opacity: 0, y: reduce ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.08 + mainNav.length * 0.06 }}
              >
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between rounded-full bg-canvas py-3 pl-6 pr-2 text-base font-semibold text-stage"
                >
                  Sign up
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900/10">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-full py-3 text-center text-base font-medium text-ink-300 ring-1 ring-inset ring-white/12"
                >
                  Log in
                </Link>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400">
                  {siteConfig.season} · {siteConfig.city}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
