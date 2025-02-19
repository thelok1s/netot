"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import logoLight from "../images/logo-light.svg";
import logoDark from "../images/logo-dark.svg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "./ui/button";
import { IoLogoGithub } from "react-icons/io5";

export default function Navbar() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const logo = resolvedTheme === "dark" ? logoLight : logoDark;

  return (
    <header className="header p-3 h-14 w-dvw bg-gray-50 dark:bg-gray-900 shadow-md flex items-center justify-between transition-colors">
      <div className="w-[100px]"></div>

      <div className="h-full">
        <Image className="h-full w-auto" src={logo} alt="Logo" priority />
      </div>

      <div className="flex items-center gap-2 w-[100px] justify-end">
        <Button variant="outline" size="icon" asChild>
          <a
            href="https://github.com/thelok1s/netot"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 flex items-center justify-center"
          >
            <IoLogoGithub />
          </a>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
