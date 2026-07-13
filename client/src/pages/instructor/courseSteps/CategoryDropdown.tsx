import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import type { Category } from "../../../api/categoryApi";

interface Props {
  value: string; // This is the ID of the category
  onChange: (v: string) => void;
  categories: Category[];
}

export function CategoryDropdown({
  value,
  onChange,
  categories = [],
}: Props) {
  const [open, setOpen] = useState(false);

  // Wrapper for outside-click detection
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuPos, setMenuPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const selectedCategoryName = useMemo(() => {
    return categories.find((cat) => cat._id === value)?.name || "";
  }, [categories, value]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;

    const compute = () => {
      const btn = buttonRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8, // mt-2 equivalent
        left: rect.left,
        width: rect.width,
      });
    };

    compute();

    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [open]);

  const menu = open ? (
    <div
      ref={menuRef}
      className="z-[1000] mt-2 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 shadow-lg"
      style={
        menuPos
          ? {
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
            }
          : { position: "fixed", top: 0, left: 0, width: 0 }
      }
    >
      {categories.length === 0 ? (
        <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
          No categories available
        </div>
      ) : (
        categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => {
              onChange(cat._id);
              setOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              value === cat._id
                ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <span>{cat.name}</span>
            {value === cat._id && (
              <Check className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            )}
          </button>
        ))
      )}
    </div>
  ) : null;

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Category
      </label>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white dark:bg-zinc-900 px-4 py-3.5 text-left text-base text-zinc-900 dark:text-white outline-none transition-all shadow-sm ${
          open
            ? "border-violet-500 ring-4 ring-violet-500/10"
            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
        }`}
      >
        <span
          className={
            value
              ? "text-zinc-900 dark:text-white"
              : "text-zinc-400 dark:text-zinc-600"
          }
        >
          {selectedCategoryName || "Select a category"}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && menuPos && createPortal(menu, document.body)}
    </div>
  );
}
