"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StringListEditor({
  value,
  onChange,
  placeholder = "Ajouter…",
  label,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  label?: string;
}) {
  const [draft, setDraft] = React.useState("");
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    onChange([...value, t]);
    setDraft("");
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      )}
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((v, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md bg-cream-50 px-3 py-2 text-sm ring-1 ring-border"
            >
              <span className="flex-1">{v}</span>
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                aria-label="Monter"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                aria-label="Descendre"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-danger"
                aria-label="Supprimer"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" size="md" onClick={add}>
          <Plus className="size-4" /> Ajouter
        </Button>
      </div>
    </div>
  );
}
