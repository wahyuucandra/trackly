"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectInlineProps {
  /** Nilai saat ini */
  value: string;
  /** Callback saat nilai berubah */
  onChange: (value: string) => void;
  /** Daftar opsi */
  options: string[];
  /** Map option value → display label */
  optionLabels?: Map<string, string>;
  /** Placeholder saat tidak ada yang dipilih */
  placeholder?: string;
  /** Placeholder untuk search input */
  searchPlaceholder?: string;
  /** Apakah search input ditampilkan */
  searchable?: boolean;
  className?: string;
}

export function SelectInline({
  value,
  onChange,
  options,
  optionLabels,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  searchable = false,
  className,
}: SelectInlineProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchable) setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [open, searchable]);

  const getLabel = (val: string) => optionLabels?.get(val) || val;

  const filtered = search
    ? options.filter((opt) => getLabel(opt).toLowerCase().includes(search.toLowerCase()))
    : options;

  const displayLabel = value ? getLabel(value) : placeholder;

  return (
    <div ref={ref} className={cn("space-y-1.5", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center justify-between gap-1.5 w-full rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors",
          "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "h-9",
          !value && "text-muted-foreground"
        )}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="border border-border rounded-md bg-popover overflow-hidden">
          {searchable && (
            <div className="relative m-1.5">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 h-7 text-xs"
              />
            </div>
          )}
          <div className="max-h-44 overflow-y-auto p-1">
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "flex items-center justify-between w-full rounded-md px-1.5 py-1.5 text-sm text-left hover:bg-accent",
                  value === opt && "bg-accent font-medium"
                )}
              >
                <span>{getLabel(opt)}</span>
                {value === opt && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground px-2 py-3 text-center">Tidak ada</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}