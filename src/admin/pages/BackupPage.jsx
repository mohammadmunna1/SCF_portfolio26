import { useCallback, useEffect, useState } from "react";
import { LuDatabaseBackup, LuDownload, LuRefreshCw, LuTriangleAlert } from "react-icons/lu";
import { COLLECTIONS } from "../../../shared/schema.js";
import { adminApi } from "../api";
import { useAuth } from "../auth";
import { SECTION_NAMES, backupPartLabel } from "../backupLabels";
import { useToast } from "../Toast";
import { Badge, Button, PageHeader, Panel, Spinner } from "../ui";

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

/** Where a backup file came from: "database", "admin download" or the site address it was taken from. */
const sourceLabel = (source = "") => {
  if (source === "database") return "the database";
  if (source === "admin download") return "an admin download";
  return source.replace(/\/api\/content$/, "") || "an unknown source";
};

const Code = ({ children }) => (
  <code className="whitespace-nowrap rounded-md bg-heading/[0.07] px-1.5 py-0.5 font-mono text-[13px] text-heading">{children}</code>
);

/**
 * The backup copy the public site falls back on when the database is unavailable: whether it still
 * matches the published content, what it covers, how to update it, and the full private backup.
 */
export default function BackupPage() {
  const { handleError } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState("");

  const refresh = useCallback(
    () =>
      adminApi
        .backupStatus()
        .then(setStatus)
        .catch((error) => {
          handleError(error);
          toast.error(error.message);
        }),
    [handleError, toast]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const run = async (key, action, done) => {
    setBusy(key);
    try {
      await action();
      toast.success(done);
    } catch (error) {
      handleError(error);
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  if (!status) return <Spinner />;
  const { bundled, live, upToDate, filled, essentialSections } = status;

  return (
    <>
      <PageHeader
        title="Backup"
        description="If the database can't be reached, your site shows this backup copy of your published content — sections, links, images and colours — instead of failing, and switches back to live content by itself."
        actions={
          <Button variant="secondary" icon={LuRefreshCw} onClick={refresh}>
            Check again
          </Button>
        }
      />

      {filled.length > 0 && (
        <div role="status" className="mb-6 flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-5 text-[15px] text-heading">
          <LuTriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="font-medium">Your site is showing part of the backup copy</p>
            <p className="mt-1 text-body">
              Missing from the database, so visitors see the backup&apos;s version: {filled.map(backupPartLabel).join(", ")}. Put
              them back with <Code>npm run restore -- --missing</Code>, or add the content again here.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-medium text-heading">Backup copy on the site</h2>
            {bundled ? (
              <Badge tone={upToDate ? "success" : "warning"}>{upToDate ? "Up to date" : "Out of date"}</Badge>
            ) : (
              <Badge tone="danger">Missing</Badge>
            )}
          </div>
          <p className="mt-2 text-[15px] text-body">
            {bundled ? (
              <>
                Taken {formatDate(bundled.generatedAt)} from {sourceLabel(bundled.source)}.{" "}
                {upToDate
                  ? "It matches what your site publishes now."
                  : "Your published content has changed since — update the backup so it shows the latest version."}
              </>
            ) : (
              "This deployment has no valid backup file (shared/fallback-content.json). Create one below."
            )}
          </p>
          <p className="mt-2 text-sm text-body/80">
            Covers {essentialSections.map((key) => SECTION_NAMES[key] || key).join(", ")} — plus the hero, footer, links and
            palette.
          </p>

          <table className="mt-5 w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-heading/10 text-xs uppercase tracking-wider text-body/80">
                <th className="py-2 font-medium">Content</th>
                <th className="py-2 text-right font-medium">In the backup</th>
                <th className="py-2 text-right font-medium">Published now</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(live.counts).map((name) => (
                <tr key={name} className="border-b border-heading/[0.06] last:border-0">
                  <td className="py-2 text-heading">{COLLECTIONS[name]?.label || name}</td>
                  <td className="py-2 text-right tabular-nums text-body">{bundled ? bundled.counts[name] : "—"}</td>
                  <td className="py-2 text-right tabular-nums text-body">{live.counts[name]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <h2 className="text-lg font-medium text-heading">Update the backup</h2>
            <p className="mt-2 text-[15px] text-body">After you change your content, so the backup matches what visitors see:</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] text-body">
              <li>
                Download the new backup file — or run <Code>npm run backup</Code> in the project, which writes it for you
                {live.usesUploadedImages ? " and copies your uploaded images" : ""}.
              </li>
              <li>
                Replace <Code>shared/fallback-content.json</Code> in the project with it.
              </li>
              <li>Commit and deploy. The site uses the new backup from the next deployment.</li>
            </ol>
            {live.usesUploadedImages && (
              <p className="mt-3 text-sm text-accent">
                Your content uses uploaded images, which a downloaded file can&apos;t include — use <Code>npm run backup</Code>.
              </p>
            )}
            <Button
              className="mt-5"
              icon={LuDownload}
              loading={busy === "file"}
              onClick={() => run("file", adminApi.downloadBackupFile, "Backup file downloaded.")}
            >
              Download backup file
            </Button>
          </Panel>

          <Panel>
            <h2 className="text-lg font-medium text-heading">Full backup (private)</h2>
            <p className="mt-2 text-[15px] text-body">
              Everything in the admin, hidden items and sections included, for safekeeping. Keep it private — don&apos;t commit
              it. Messages and admin accounts aren&apos;t included.
            </p>
            <p className="mt-2 text-sm text-body/80">
              Restore it with <Code>npm run restore -- --all --file &lt;file&gt;</Code>.
            </p>
            <Button
              variant="secondary"
              className="mt-5"
              icon={LuDatabaseBackup}
              loading={busy === "full"}
              onClick={() => run("full", adminApi.downloadBackup, "Full backup downloaded.")}
            >
              Download full backup
            </Button>
          </Panel>
        </div>
      </div>
    </>
  );
}
