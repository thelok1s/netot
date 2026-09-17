"use client";

import * as React from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Выбрать тему оформления"
          className="theme-trigger"
        >
          <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Выбрать тему оформления</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="theme-menu">
        <DropdownMenuItem
          className="theme-menu-item"
          onClick={() => setTheme("light")}
        >
          <Sun aria-hidden="true" />
          Светлая
          {theme === "light" && (
            <Check className="theme-check" aria-hidden="true" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="theme-menu-item"
          onClick={() => setTheme("dark")}
        >
          <Moon aria-hidden="true" />
          Темная
          {theme === "dark" && (
            <Check className="theme-check" aria-hidden="true" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="theme-menu-item"
          onClick={() => setTheme("system")}
        >
          <Monitor aria-hidden="true" />
          Как в системе
          {theme === "system" && (
            <Check className="theme-check" aria-hidden="true" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
