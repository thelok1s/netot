import { IoLogoGithub } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="footer h-fit p-3 w-dvw flex items-center justify-center text-gray-400">
      <p>
        Made by lok1s{"\u00A0"}
        <a
          className="h-fit w-fit inline-flex align-middle mb-1"
          href="https://github.com/thelok1s/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IoLogoGithub className="inline-block transition-colors hover:fill-black dark:fill-white h-5 w-5" />
        </a>
      </p>
    </footer>
  );
}
