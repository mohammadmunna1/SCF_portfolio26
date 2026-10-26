import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import { Outlet, useLocation } from "react-router-dom";
import BackToTop from "../Components/BackToTop";
import Footer from "../Components/Footer";
import Nav from "../Components/Nav";
import Preloader from "../Components/Preloader";
import { ContentProvider, useContentState } from "../context/ContentContext";
import { SPRING_UI } from "../lib/motion";
import { applyTheme, clearTheme, readPreviewTheme } from "../lib/theme";

/** Scrolls to the top on page changes, or to the #section in the URL once it has rendered. */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return undefined;
    }
    const id = decodeURIComponent(hash.slice(1));
    let attempts = 0;
    let timer;
    const scroll = () => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (attempts++ < 30) timer = setTimeout(scroll, 60);
    };
    scroll();
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}

/**
 * Applies the published palette — or, when an admin opens "Preview on site", the unsaved one
 * from the URL (kept while browsing the site, never stored).
 */
function useSiteTheme(theme) {
  const [preview, setPreview] = useState(() => readPreviewTheme());

  useEffect(() => {
    if (theme) applyTheme(preview || theme);
  }, [preview, theme]);

  // Back to the stylesheet defaults when leaving the public site (e.g. for the admin panel).
  useEffect(() => clearTheme, []);

  const exitPreview = () => {
    setPreview(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("previewTheme");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  };

  return { previewing: Boolean(preview), exitPreview };
}

function PreviewBanner({ onExit }) {
  return (
    <motion.div
      role="status"
      className="fixed inset-x-0 bottom-4 z-[95] flex justify-center px-4"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={SPRING_UI}
    >
      <div className="flex items-center gap-3 rounded-full bg-button py-1.5 pl-5 pr-1.5 text-caps uppercase text-button-text shadow-lg">
        Previewing an unsaved palette
        <button
          type="button"
          onClick={onExit}
          className="flex h-8 items-center gap-1.5 rounded-full border border-button-text/30 px-3 transition-colors hover:bg-button-text hover:text-button"
        >
          <LuX aria-hidden="true" className="h-3.5 w-3.5" />
          Exit
        </button>
      </div>
    </motion.div>
  );
}

function SiteShell() {
  const { content } = useContentState();
  const { previewing, exitPreview } = useSiteTheme(content?.theme);

  return (
    <>
      <AnimatePresence>{!content && <Preloader key="preloader" />}</AnimatePresence>
      {content && (
        <>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-button focus:px-5 focus:py-3 focus:text-button-text"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main" className="relative overflow-x-clip">
            <Outlet />
          </main>
          <Footer />
          <BackToTop />
          <ScrollManager />
          <AnimatePresence>{previewing && <PreviewBanner key="preview" onExit={exitPreview} />}</AnimatePresence>
        </>
      )}
    </>
  );
}

/** Public site frame: content loading, theme, navigation, page outlet and footer. */
const SiteLayout = () => (
  <ContentProvider>
    <SiteShell />
  </ContentProvider>
);

export default SiteLayout;
