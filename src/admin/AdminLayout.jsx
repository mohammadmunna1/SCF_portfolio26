import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LuArrowUpRight,
  LuAward,
  LuBriefcase,
  LuBug,
  LuCodeXml,
  LuDatabaseBackup,
  LuGauge,
  LuGraduationCap,
  LuInbox,
  LuKeyRound,
  LuLayers,
  LuLayoutDashboard,
  LuLink,
  LuLogOut,
  LuMenu,
  LuMessageCircle,
  LuPalette,
  LuPanelsTopLeft,
  LuQuote,
  LuTrophy,
  LuTruck,
  LuUser,
  LuX,
} from "react-icons/lu";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { COLLECTIONS } from "../../shared/schema.js";
import { adminApi } from "./api";
import { useAuth } from "./auth";
import { PROJECT_GROUPS } from "./projectGroups";

const COLLECTION_ICONS = {
  layout: LuPanelsTopLeft,
  briefcase: LuBriefcase,
  "graduation-cap": LuGraduationCap,
  award: LuAward,
  trophy: LuTrophy,
  layers: LuLayers,
  gauge: LuGauge,
  link: LuLink,
  message: LuMessageCircle,
  quote: LuQuote,
};

const PROJECT_ICONS = { "supply-chain": LuTruck, qa: LuBug, development: LuCodeXml };

// Roughly the homepage order (the projects have their own group, above).
const CONTENT_ORDER = [
  "sections",
  "experience",
  "education",
  "certifications",
  "achievements",
  "skills",
  "stats",
  "socials",
  "faqs",
  "testimonials",
];

function NavItem({ to, icon: Icon, label, badge, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-[7px] text-[14.5px] transition-colors ${
          isActive ? "bg-button text-button-text" : "text-body hover:bg-heading/[0.06] hover:text-heading"
        }`
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate">{label}</span>
      {badge > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-on">{badge}</span>}
    </NavLink>
  );
}

const GroupLabel = ({ children }) => (
  <p className="px-3 pb-1 pt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-body/70">{children}</p>
);

function Sidebar({ unread, onNavigate }) {
  const { admin, logout } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-3 pt-5 pr-12 lg:pr-5">
        <p className="truncate text-[15px] font-medium text-heading" title={admin?.email}>
          {admin?.email}
        </p>
      </div>
      <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <NavItem to="/admin" end icon={LuLayoutDashboard} label="Dashboard" onNavigate={onNavigate} />
        <NavItem to="/admin/profile" icon={LuUser} label="Profile" onNavigate={onNavigate} />
        <NavItem to="/admin/theme" icon={LuPalette} label="Theme & colours" onNavigate={onNavigate} />
        <GroupLabel>Projects</GroupLabel>
        {PROJECT_GROUPS.map((group) => (
          <NavItem
            key={group.key}
            to={`/admin/projects/${group.key}`}
            icon={PROJECT_ICONS[group.key]}
            label={group.label}
            onNavigate={onNavigate}
          />
        ))}
        <GroupLabel>Content</GroupLabel>
        {CONTENT_ORDER.map((name) => (
          <NavItem
            key={name}
            to={`/admin/collections/${name}`}
            icon={COLLECTION_ICONS[COLLECTIONS[name].icon] || LuLayers}
            label={COLLECTIONS[name].label}
            onNavigate={onNavigate}
          />
        ))}
        <GroupLabel>Inbox & account</GroupLabel>
        <NavItem to="/admin/messages" icon={LuInbox} label="Messages" badge={unread} onNavigate={onNavigate} />
        <NavItem to="/admin/backup" icon={LuDatabaseBackup} label="Backup" onNavigate={onNavigate} />
        <NavItem to="/admin/account" icon={LuKeyRound} label="Account" onNavigate={onNavigate} />
      </nav>
      <div className="space-y-1 border-t border-heading/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[14.5px] text-body hover:bg-heading/[0.06] hover:text-heading"
        >
          <LuArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
          View site
        </a>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14.5px] text-body hover:bg-heading/[0.06] hover:text-heading"
        >
          <LuLogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { admin, handleError } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Refresh the unread badge as the admin moves around (cheap, and keeps it current after reading mail).
  useEffect(() => {
    adminApi
      .overview()
      .then((data) => setUnread(data.messages.unread))
      .catch(handleError);
  }, [pathname, handleError]);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-canvas text-heading lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-heading/10 bg-surface lg:block">
        <Sidebar unread={unread} />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-heading/10 bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
        <p className="min-w-0 truncate pr-3 text-[15px] font-medium text-heading" title={admin?.email}>
          {admin?.email}
        </p>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-lg border border-heading/15 text-heading"
        >
          <LuMenu className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-canvas/80" onClick={() => setMenuOpen(false)} aria-hidden="true" />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[280px] border-r border-heading/10 bg-surface"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
            >
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-5 grid h-9 w-9 place-items-center rounded-lg text-body hover:text-heading"
              >
                <LuX className="h-5 w-5" />
              </button>
              <Sidebar unread={unread} onNavigate={() => setMenuOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-6xl">
          <Outlet context={{ refreshUnread: setUnread }} />
        </div>
      </main>
    </div>
  );
}
