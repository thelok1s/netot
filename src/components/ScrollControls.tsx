"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

function scrollToPosition(top: number) {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  window.scrollTo({
    top,
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

export default function ScrollControls() {
  return (
    <nav className="scroll-controls" aria-label="Навигация по странице">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="scroll-control"
        onClick={() => scrollToPosition(0)}
        aria-label="Наверх страницы"
        title="Наверх"
      >
        <ChevronUp aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="scroll-control"
        onClick={() => scrollToPosition(document.documentElement.scrollHeight)}
        aria-label="Вниз страницы"
        title="Вниз"
      >
        <ChevronDown aria-hidden="true" />
      </Button>
    </nav>
  );
}
