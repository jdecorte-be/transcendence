import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export function classNames(...args: (string | number | boolean | undefined)[]) {
  return twMerge(...args.filter(Boolean).map(String));
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Transcendence` : "Transcendence";
  }, [title]);
}

export function onEnterOrSpace(handler: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };
}
