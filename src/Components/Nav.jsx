import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useActiveSection, useLockBodyScroll, useScrollState } from "../hooks/useScrollState";
import { EASE_OUT, SPRING_UI } from "../lib/motion";
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

/** Two lines that turn into a cross — inside the light circle of the menu pill. */
function MenuGlyph({ open }) {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-button text-button-text">
      <span className="relative block h-2 w-3.5">
        <motion.span
          className="absolute left-0 top-0 h-px w-3.5 bg-current"
          animate={open ? { y: 3.5, rotate: 45 } : { y: 0, rotate: 0 }}
          transition={SPRING_UI}
        />
        <motion.span
          className="absolute bottom-0 left-0 h-px w-3.5 bg-current"
          animate={open ? { y: -4, rotate: -45 } : { y: 0, rotate: 0 }}
          transition={SPRING_UI}
        />
      </span>
    </span>
  );
}

function MenuPanel({ links, onHome, active, onClose }) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef, true, onClose);

  return createPortal(
    <>
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 z-[60] bg-canvas/40 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
      <motion.div
        ref={panelRef}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-y-0 right-0 z-[70] flex w-full flex-col overflow-y-auto rounded-l-[28px] bg-button text-button-text sm:w-[min(36rem,92vw)]"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%", transition: { duration: 0.45, ease: EASE_OUT } }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-end px-5 sm:px-8 md:h-[92px] xl:pr-20">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center gap-3 rounded-full bg-surface-raised py-1 pl-1 pr-5 text-heading"
          >
            <MenuGlyph open />
            <span className="caps">Close</span>
          </button>
        </div>

        <nav aria-label="Site" className="flex flex-1 flex-col justify-center px-8 py-6 sm:px-14">
          <ul>
            {links.map((link, index) => (
              <motion.li
                key={link.key}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 + index * 0.045 }}
              >
                <SectionLink
                  id={link.key}
                  onHome={onHome}
                  onClick={onClose}
                  aria-current={active === link.key ? "true" : undefined}
                  className="roll-host block py-1 text-[clamp(2.25rem,4.2vw,3.25rem)] font-light uppercase leading-[1.1] tracking-[-0.01em]"
                >
                  <RollText copyClassName="text-button-text/45">{link.navLabel}</RollText>
                </SectionLink>
              </motion.li>
            ))}
            <motion.li
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 + links.length * 0.045 }}
            >
              <Link
                to="/projects"
                onClick={onClose}
                className="roll-host block py-1 text-[clamp(2.25rem,4.2vw,3.25rem)] font-light uppercase leading-[1.1] tracking-[-0.01em]"
              >
                <RollText copyClassName="text-button-text/45">All projects</RollText>
              </Link>
            </motion.li>
          </ul>
        </nav>
      </motion.div>
    </>,
    document.body
  );
}

/** Logo and the reference's "Menu" pill, which opens a full-height side panel. */
const Nav = () => {
  const { profile, sections } = useContent();
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const { scrolled, hidden } = useScrollState();
  useLockBodyScroll(open);

  const links = [{ key: "home", navLabel: "Home" }, ...sections.filter((section) => section.navLabel)];
  const active = useActiveSection(onHome ? links.map((link) => link.key) : []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: hidden && !open ? "-110%" : 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 border-b border-line bg-canvas/85 backdrop-blur-md"
          initial={false}
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <nav aria-label="Main" className="container-site relative flex h-[76px] items-center justify-between md:h-[92px]">
          <Link to="/" className="roll-host text-[19px] font-normal tracking-[0.01em] text-heading md:text-[22px]">
            <RollText copy={profile.brandHover} copyClassName="text-muted">
              {profile.brand || profile.name}
            </RollText>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="flex h-11 items-center gap-3 rounded-full bg-surface-raised py-1 pl-5 pr-1 text-heading transition-colors hover:bg-line-strong/60"
          >
            <span className="caps">Menu</span>
            <MenuGlyph open={false} />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <MenuPanel
            key="menu"
            links={links}
            onHome={onHome}
            active={active}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
