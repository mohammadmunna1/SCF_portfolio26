import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LuArrowRight, LuDownload, LuMenu, LuX } from "react-icons/lu";
import { Link, useLocation } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useActiveSection, useLockBodyScroll, useScrollState } from "../hooks/useScrollState";
import { EASE_OUT } from "../lib/motion";
import { cvLinkProps, twoDigits } from "../lib/text";
import { Button } from "./ui/Buttons";
import RollText from "./ui/RollText";

/** In-page link on the homepage, router link (back to the homepage section) elsewhere. */
export function SectionLink({ id, onHome, children, ...rest }) {
  return onHome ? (
    <a href={`#${id}`} {...rest}>
      {children}
    </a>
  ) : (
    <Link to={id === "home" ? "/" : `/#${id}`} {...rest}>
      {children}
    </Link>
  );
}

/** The menu on phones and tablets: a sheet below the header, listing every section. */
function MenuPanel({ links, onHome, active, resumeUrl, onClose }) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef, true, onClose);

  return createPortal(
    <>
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 z-[60] bg-heading/20 backdrop-blur-[2px]"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        ref={panelRef}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-x-3 top-3 z-[70] max-h-[calc(100svh-1.5rem)] overflow-y-auto rounded-2xl border border-line bg-surface-raised p-2 shadow-xl sm:left-auto sm:w-[22rem]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
      >
        <div className="flex items-center justify-between py-1 pl-4 pr-1">
          <span className="eyebrow">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-10 w-10 place-items-center rounded-full text-heading transition-colors hover:bg-heading/[0.06]"
          >
            <LuX aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Site">
          <ul className="divide-y divide-line border-y border-line">
            {links.map((link, index) => (
              <li key={link.key}>
                <SectionLink
                  id={link.key}
                  onHome={onHome}
                  onClick={onClose}
                  aria-current={active === link.key ? "true" : undefined}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 text-[1.0625rem] font-medium text-heading transition-colors hover:bg-heading/[0.04]"
                >
                  {link.navLabel}
                  <span className={`eyebrow ${active === link.key ? "text-accent" : ""}`}>{twoDigits(index + 1)}</span>
                </SectionLink>
              </li>
            ))}
            <li>
              <Link
                to="/projects"
                onClick={onClose}
                className="flex items-center justify-between gap-4 px-4 py-3.5 text-[1.0625rem] font-medium text-heading transition-colors hover:bg-heading/[0.04]"
              >
                All projects
                <LuArrowRight aria-hidden="true" className="h-4 w-4 text-muted" />
              </Link>
            </li>
          </ul>
        </nav>
        {resumeUrl && (
          <Button href={resumeUrl} variant="primary" leadingIcon={LuDownload} className="mt-2 w-full" {...cvLinkProps(resumeUrl)}>
            Download CV
          </Button>
        )}
      </motion.div>
    </>,
    document.body
  );
}

/**
 * The site header: the name (rolling to the professional title on hover), the section links — inline on
 * large screens, in a menu below that — and the Download CV button. It tucks away while scrolling down.
 */
const Nav = () => {
  const { profile, sections } = useContent();
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const { scrolled, hidden } = useScrollState();
  useLockBodyScroll(open);

  const links = sections.filter((section) => section.navLabel);
  const active = useActiveSection(onHome ? links.map((link) => link.key) : []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={false}
        animate={{ y: hidden && !open ? "-100%" : 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-0 border-b transition-colors duration-300 ${
            scrolled ? "border-line bg-canvas/90 backdrop-blur-md" : "border-transparent bg-canvas/0"
          }`}
        />
        <nav aria-label="Main" className="container-site relative flex h-[68px] items-center justify-between gap-6 md:h-[76px]">
          <Link to="/" className="roll-host shrink-0 text-[1.0625rem] font-semibold tracking-[-0.01em] text-heading">
            <RollText copy={profile.brandHover} copyClassName="text-accent">
              {profile.brand || profile.name}
            </RollText>
          </Link>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {links.map((link) => (
              <li key={link.key}>
                <SectionLink
                  id={link.key}
                  onHome={onHome}
                  aria-current={active === link.key ? "true" : undefined}
                  className={`relative block rounded-full px-3 py-2 text-[0.875rem] font-medium transition-colors ${
                    active === link.key ? "text-heading" : "text-body hover:text-heading"
                  }`}
                >
                  {link.navLabel}
                  {active === link.key && (
                    <span aria-hidden="true" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />
                  )}
                </SectionLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {profile.resumeUrl && (
              <Button
                href={profile.resumeUrl}
                size="sm"
                variant="primary"
                leadingIcon={LuDownload}
                className="hidden sm:inline-flex"
                {...cvLinkProps(profile.resumeUrl)}
              >
                Download CV
              </Button>
            )}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="btn btn-sm btn-outline xl:hidden"
            >
              <LuMenu aria-hidden="true" className="h-4 w-4" />
              Menu
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <MenuPanel
            key="menu"
            links={links}
            onHome={onHome}
            active={active}
            resumeUrl={profile.resumeUrl}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
