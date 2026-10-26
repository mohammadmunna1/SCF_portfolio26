import { Fragment } from "react";
import { LuArrowUpRight, LuDownload, LuFactory, LuShip, LuTruck, LuUserRound, LuWarehouse, LuWheat } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { cvLinkProps } from "../lib/text";
import { SectionLink } from "./Nav";
import { Button, NodesIcon } from "./ui/Buttons";
import Reveal from "./ui/Reveal";

// The footer links to just these sections after Home; every section is in the menu.
const FOOTER_SECTIONS = ["about", "experience", "work", "courses", "contact"];

// Field to consumer, in short — the truck on the road is the one marked.
const ROUTE = [LuWheat, LuFactory, LuShip, LuWarehouse, LuTruck, LuUserRound];

/** The supply chain from field to consumer as a quiet line of icons, drawn in the band's text colour. */
function DeliveryRoute() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute bottom-8 right-8 hidden items-center gap-2.5 text-button-text/50 lg:flex">
      {ROUTE.map((Icon, index) => (
        <Fragment key={index}>
          {index > 0 && <span className="w-7 border-t border-dashed border-current xl:w-10" />}
          {Icon === LuTruck ? (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-on">
              <Icon className="h-[18px] w-[18px]" />
            </span>
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </Fragment>
      ))}
    </div>
  );
}

/** Closing call to action in an inverted band, then site links, profiles and the copyright line. */
const Footer = () => {
  const { profile, sections, socials } = useContent();
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const links = FOOTER_SECTIONS.map((key) => sections.find((section) => section.key === key)).filter(
    (section) => section?.navLabel
  );
  const year = new Date().getFullYear();

  return (
    <footer className="pt-6 md:pt-10">
      <div className="container-site">
        <Reveal className="relative overflow-hidden rounded-3xl bg-button px-6 py-14 text-button-text sm:px-10 md:px-14 md:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: "radial-gradient(rgb(var(--c-button-text)) 1px, transparent 1.2px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative">
            <p className="eyebrow text-button-text/60">What&apos;s next</p>
            {profile.ctaTitle && (
              <p className="display mt-4 max-w-[16ch] text-display-xl text-button-text">{profile.ctaTitle}</p>
            )}
            <div className="mt-10 flex flex-wrap gap-3">
              {onHome ? (
                <Button href="#contact" leadingIcon={NodesIcon} className="border-button-text bg-button-text text-button hover:border-button-text hover:bg-button-text/90">
                  {profile.ctaButtonLabel || "Get in touch"}
                </Button>
              ) : (
                <Button to="/#contact" leadingIcon={NodesIcon} className="border-button-text bg-button-text text-button hover:border-button-text hover:bg-button-text/90">
                  {profile.ctaButtonLabel || "Get in touch"}
                </Button>
              )}
              {profile.resumeUrl && (
                <Button
                  href={profile.resumeUrl}
                  leadingIcon={LuDownload}
                  className="border-button-text/40 text-button-text hover:border-button-text hover:bg-button-text/10"
                  {...cvLinkProps(profile.resumeUrl)}
                >
                  Download CV
                </Button>
              )}
            </div>
          </div>
          <DeliveryRoute />
        </Reveal>
      </div>

      {/* Extra room at the bottom on phones keeps the last line clear of the floating back-to-top button */}
      <div className="container-site mt-12 md:mt-16">
        <div className="grid gap-6 border-t border-line pb-10 pt-8 max-md:pb-24 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <p className="text-[0.875rem] text-muted">
            © {year} {profile.name}
          </p>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <SectionLink id="home" onHome={onHome} className="link text-[0.875rem] font-medium text-heading">
                  Home
                </SectionLink>
              </li>
              {links.map((link) => (
                <li key={link.key}>
                  <SectionLink id={link.key} onHome={onHome} className="link text-[0.875rem] font-medium text-heading">
                    {link.navLabel}
                  </SectionLink>
                </li>
              ))}
            </ul>
          </nav>
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:justify-end">
              {socials.map((social) => (
                <li key={social.id}>
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className="link text-[0.875rem] font-medium text-heading">
                    {social.label}
                    <LuArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
