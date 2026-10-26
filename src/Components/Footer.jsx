import { LuArrowUpRight } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { SectionLink } from "./Nav";
import { MaskText } from "./ui/AnimatedText";
import { Button, NodesIcon } from "./ui/Buttons";
import Reveal from "./ui/Reveal";

// The footer links to just these sections after Home; every section is in the menu.
const FOOTER_SECTIONS = ["about", "experience"];

/**
 * Closing call to action in giant type, then site links, copyright and profiles (reference footer).
 * On phones that last block is centred under the call to action, the copyright last.
 */
const Footer = () => {
  const { profile, sections, socials } = useContent();
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const links = FOOTER_SECTIONS.map((key) => sections.find((section) => section.key === key)).filter(
    (section) => section?.navLabel
  );
  const year = new Date().getFullYear();

  return (
    <footer className="pt-24 md:pt-36">
      <div className="container-site flex flex-col items-center text-center">
        {profile.ctaTitle && (
          <MaskText
            as="p"
            text={profile.ctaTitle}
            className="display text-[30vw] leading-[0.9] text-balance sm:text-display-xl"
          />
        )}
        <Reveal delay={0.2} className="mt-10 md:mt-12">
          {onHome ? (
            <Button href="#contact" leadingIcon={NodesIcon}>
              {profile.ctaButtonLabel || "Get in touch"}
            </Button>
          ) : (
            <Button to="/#contact" leadingIcon={NodesIcon}>
              {profile.ctaButtonLabel || "Get in touch"}
            </Button>
          )}
        </Reveal>
      </div>

      {/* Extra room at the bottom on phones keeps the last line clear of the floating back-to-top button */}
      <div className="container-site mt-24 grid gap-8 pb-10 md:mt-36 lg:grid-cols-3 lg:items-end max-md:justify-items-center max-md:pb-24 max-md:text-center">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 max-md:justify-center">
            <li>
              <SectionLink id="home" onHome={onHome} className="caps link text-heading">
                Home
              </SectionLink>
            </li>
            {links.map((link) => (
              <li key={link.key}>
                <SectionLink id={link.key} onHome={onHome} className="caps link text-heading">
                  {link.navLabel}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>
        <p className="caps text-muted lg:text-center max-md:order-last">
          © {year} {profile.name}
        </p>
        {socials.length > 0 && (
          <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:justify-end max-md:justify-center">
            {socials.map((social) => (
              <li key={social.id}>
                <a href={social.url} target="_blank" rel="noopener noreferrer" className="caps link text-heading">
                  {social.label}
                  <LuArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
};

export default Footer;
