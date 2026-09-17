import { IoLogoGithub } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="footer site-footer">
      <p>
        Сделано lok1s{" "}
        <a
          className="footer-github"
          href="https://github.com/thelok1s/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Профиль lok1s на GitHub"
        >
          <IoLogoGithub aria-hidden="true" />
        </a>
      </p>
    </footer>
  );
}
