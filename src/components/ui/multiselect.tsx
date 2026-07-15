"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";

interface MultiSelectProps {
    label: string;
    options: string[];
    /** Map option value → display label. Falls back to option value if not found. */
    optionLabels?: Map<string, string>;
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    label,
    options,
    optionLabels,
    selected,
    onChange,
    placeholder = "Cari...",
    className,
}: MultiSelectProps) {
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
        if (open) setTimeout(() => searchInputRef.current?.focus(), 0);
    }, [open]);

    const getLabel = (val: string) => optionLabels?.get(val) || val;

    const filtered = search
        ? options.filter((opt) => getLabel(opt).toLowerCase().includes(search.toLowerCase()))
        : options;

    const allSelected = options.length > 0 && selected.length === options.length;
    const someSelected = selected.length > 0 && selected.length < options.length;

    const handleSelectAll = () => {
        if (allSelected) {
            onChange([]);
        } else {
            onChange([...options]);
        }
    };

    const toggle = (val: string) => {
        onChange(selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val]);
    };

    return (
        <div ref={ref} className={`relative ${className || ""}`}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(!open)}
                className="h-10 text-sm gap-1.5 font-normal w-full justify-start rounded-md"
            >
                <span className="truncate">{label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
            </Button>
            {open && (
                <div className="absolute top-full left-0 mt-1 z-[9999] w-full min-w-[200px] bg-popover border border-border rounded-lg shadow-lg p-1.5">
                    <div className="relative mb-1.5">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder={placeholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-7 h-8 text-sm"
                        />
                    </div>
                    <label className="w-full flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => { if (el) el.indeterminate = someSelected; }}
                            onChange={handleSelectAll}
                            className="rounded accent-primary mr-2"
                        />
                        {allSelected ? "Unselect All" : "Select All"}
                    </label>
                    <div className="max-h-44 overflow-y-auto mt-1">
                        {filtered.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm hover:bg-secondary cursor-pointer">
                                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="rounded accent-primary" />
                                {getLabel(opt)}
                            </label>
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