"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import logoLight from "../images/logo-light.svg";
import logoDark from "../images/logo-dark.svg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "./ui/button";
import { IoLogoGithub } from "react-icons/io5";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Navbar() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!mounted) {
    return null;
  }

  const logo = resolvedTheme === "dark" ? logoLight : logoDark;

  return (
    <header className="header site-header">
      <div className="site-nav mx-auto">
        <div className="w-[5.5rem] sm:w-28" />

        <div>
          <Image className="site-logo" src={logo} alt="neTOT" priority />
        </div>

        <div className="flex w-[5.5rem] justify-end gap-2 sm:w-28">
          <Button variant="outline" size="icon" asChild>
            <a
              href="https://github.com/thelok1s/netot"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 flex items-center justify-center"
            >
              <IoLogoGithub aria-hidden="true" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
