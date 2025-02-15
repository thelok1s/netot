import Image from "next/image";
import { useTheme } from "next-themes";
import logoLight from "../images/logo-light.svg";
import logoDark from "../images/logo-dark.svg";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const logo = theme === "dark" ? logoLight : logoDark;
  return (
    <header className="header p-3 h-14 w-dvw bg-gray-50 dark:bg-gray-900 shadow-md flex items-center justify-center transition-colors">
      <a
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-full"
      >
        <Image className="h-full" src={logo} alt="Logo" />
      </a>
    </header>
  );
}