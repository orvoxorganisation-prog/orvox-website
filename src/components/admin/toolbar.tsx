"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import { cn } from "@/lib/utils";

/** Debounced search box that drives the `q` URL param. */
export function SearchInput({ placeholder = "Search…", paramKey = "q" }: { placeholder?: string; paramKey?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(searchParams.get(paramKey) ?? "");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function update(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set(paramKey, next);
      else params.delete(paramKey);
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
  }

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" strokeWidth={1.75} />
      <input
        type="search"
        value={value}
        onChange={(e) => update(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full rounded-full bg-white/[0.04] pl-9 pr-4 text-sm text-canvas placeholder:text-ink-400",
          "ring-1 ring-inset ring-white/12 transition-[box-shadow,ring-color] duration-200",
          "focus:outline-none focus:ring-2 focus:ring-yellow",
        )}
      />
    </div>
  );
}

/** Filter dropdown that drives a named URL param. "All" clears it. */
export function FilterSelect({
  paramKey,
  options,
  placeholder,
  allLabel = "All",
}: {
  paramKey: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  allLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "";

  const labels = [allLabel, ...options.map((o) => o.label)];
  const byLabel = new Map(options.map((o) => [o.label, o.value]));
  const currentLabel = options.find((o) => o.value === current)?.label ?? allLabel;

  function onChange(label: string) {
    const params = new URLSearchParams(searchParams.toString());
    const value = label === allLabel ? "" : byLabel.get(label) ?? "";
    if (value) params.set(paramKey, value);
    else params.delete(paramKey);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="w-full sm:w-44">
      <SelectField value={currentLabel} onValueChange={onChange} options={labels} placeholder={placeholder} className="h-10" />
    </div>
  );
}
