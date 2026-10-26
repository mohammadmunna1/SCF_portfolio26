import { useEffect, useState } from "react";
import { LuArrowRight, LuArrowUpRight, LuInbox, LuPalette, LuPlus, LuTriangleAlert, LuUser } from "react-icons/lu";
import { Link } from "react-router-dom";
import { COLLECTIONS } from "../../../shared/schema.js";
import { adminApi } from "../api";
import { useAuth } from "../auth";
import { useToast } from "../Toast";
import { backupPartLabel } from "../backupLabels";
import { PageHeader, Panel, Spinner } from "../ui";

const SHOWN = ["projects", "certifications", "experience", "education", "skills", "sqaProjects", "achievements", "faqs"];

export default function DashboardPage() {
  const { handleError } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi
      .overview()
      .then(setData)
      .catch((error) => {
        handleError(error);
        toast.error(error.message);
      });
  }, [handleError, toast]);

  if (!data) return <Spinner />;
  const { counts, messages, backupFilled = [] } = data;

  const quickActions = [
    { to: "/admin/profile", icon: LuUser, label: "Edit profile & hero" },
    { to: "/admin/collections/projects", icon: LuPlus, label: "Manage projects" },
    { to: "/admin/collections/certifications", icon: LuPlus, label: "Manage courses & certifications" },
    { to: "/admin/theme", icon: LuPalette, label: "Customise colours" },
    { to: "/admin/collections/sections", icon: LuArrowRight, label: "Show, hide or reorder sections" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="An overview of your portfolio content." />

      {backupFilled.length > 0 && (
        <Link
          to="/admin/backup"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-[15px] text-heading hover:border-accent/70"
        >
          <LuTriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <span>
            Missing from the database, so the site shows the backup copy: {backupFilled.map(backupPartLabel).join(", ")}.{" "}
            <span className="text-body">Open Backup →</span>
          </span>
        </Link>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SHOWN.map((name) => (
          <Link
            key={name}
            to={`/admin/collections/${name}`}
            className="group rounded-2xl border border-heading/[0.07] bg-surface p-5 transition-colors hover:border-heading/25"
          >
            <p className="text-sm text-body">{COLLECTIONS[name].label}</p>
            <p className="mt-3 text-4xl font-extralight text-heading">{counts[name]?.total ?? 0}</p>
            <p className="mt-1 text-xs text-body/80">
              {counts[name]?.visible ?? 0} visible
              {counts[name]?.total > counts[name]?.visible ? ` · ${counts[name].total - counts[name].visible} hidden` : ""}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-medium text-heading">
              <LuInbox className="h-5 w-5" aria-hidden="true" /> Recent messages
            </h2>
            <Link to="/admin/messages" className="text-sm text-body hover:text-heading">
              {messages.unread ? `${messages.unread} unread` : "View all"} →
            </Link>
          </div>
          {messages.recent.length ? (
            <ul className="mt-4 divide-y divide-heading/[0.07]">
              {messages.recent.map((message) => (
                <li key={message.id} className="py-3">
                  <p className="flex items-center gap-2 text-[15px]">
                    {!message.read && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="Unread" />}
                    <span className="font-medium text-heading">{message.name}</span>
                    <span className="truncate text-sm text-body/80">{message.email}</span>
                  </p>
                  <p className="mt-1 truncate text-sm text-body">{message.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-body">No messages yet. Contact-form submissions will appear here.</p>
          )}
        </Panel>

        <Panel>
          <h2 className="text-lg font-medium text-heading">Quick actions</h2>
          <div className="mt-4 space-y-2">
            {quickActions.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border border-heading/10 px-4 py-3 text-[15px] text-heading hover:border-heading/30">
                <Icon className="h-4 w-4 text-body" aria-hidden="true" />
                {label}
              </Link>
            ))}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-heading/10 px-4 py-3 text-[15px] text-heading hover:border-heading/30"
            >
              <LuArrowUpRight className="h-4 w-4 text-body" aria-hidden="true" />
              Open the live site
            </a>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-body/80">
            Changes publish immediately. Visitors may see cached content for a few seconds.
          </p>
        </Panel>
      </div>
    </>
  );
}
