import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LuArrowUpRight, LuCheck, LuRotateCcw, LuTriangleAlert, LuUpload, LuWandSparkles } from "react-icons/lu";
import {
  DEFAULT_THEME,
  THEME_PRESETS,
  THEME_TOKENS,
  checkThemeContrast,
  dangerColor,
  fixThemeContrast,
  hexToChannels,
  resolveTheme,
  themeToCssVars,
} from "../../../shared/theme.js";
import { resolveAsset } from "../../lib/api";
import { previewUrl } from "../../lib/theme";
import { adminApi } from "../api";
import { useAuth } from "../auth";
import { ColorInput } from "../fields";
import { useToast } from "../Toast";
import { Badge, Button, PageHeader, Panel, Spinner } from "../ui";

const KEY = "theme";
const GROUPS = [...new Set(THEME_TOKENS.map((token) => token.group))];
const samePalette = (a, b) => THEME_TOKENS.every(({ key }) => a[key] === b[key]);
const presetFor = (palette) => THEME_PRESETS.find((preset) => samePalette(preset.colors, palette));
const SWATCH_KEYS = ["background", "surfaceRaised", "heading", "photoCard", "accent"];

/** The palette's CSS variables, scoped to one element — the same variables the live site reads. */
const scopedVars = (palette) => ({ ...themeToCssVars(palette), "--c-danger": hexToChannels(dangerColor(palette)) });

/** A miniature of the site drawn with the draft palette (same token classes as the real components). */
function ThemePreview({ palette, profile }) {
  return (
    <div style={scopedVars(palette)} aria-hidden="true" className="overflow-hidden rounded-xl border border-heading/10 bg-canvas text-[11px] leading-4 text-body">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="text-[12px] font-semibold text-heading">{profile.brand || profile.name || "Portfolio"}</span>
        <span className="flex items-center gap-3 text-[9.5px] font-medium">
          <span className="text-heading">About</span>
          <span>Projects</span>
          <span className="inline-flex h-5 items-center rounded-full bg-button px-2.5 text-button-text">Download CV</span>
        </span>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] items-center gap-4 px-4 pb-5 pt-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-raised px-2 py-0.5 text-[8.5px] font-medium text-heading">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {profile.availability || "Open to new roles"}
          </span>
          <p className="mt-2.5 font-mono text-[8px] uppercase tracking-[0.12em] text-muted">{profile.role || "Professional title"}</p>
          <p className="display mt-1 text-[19px] leading-[1.08] tracking-[-0.03em]">{profile.headline || "Your headline"}</p>
          <p className="mt-2 line-clamp-3 text-[9px] leading-[0.8rem]">{profile.heroIntro || "A short introduction under the headline."}</p>
          <div className="mt-3 flex gap-1.5">
            <span className="inline-flex h-5 items-center rounded-full bg-button px-2.5 text-[8.5px] font-medium text-button-text">Explore my projects</span>
            <span className="inline-flex h-5 items-center rounded-full border border-line-strong px-2.5 text-[8.5px] font-medium text-heading">
              View my background
            </span>
          </div>
        </div>
        <div className="relative mx-auto aspect-[5/6] w-full max-w-[9rem]">
          <span className="absolute inset-[6%] rounded-full border border-dashed border-line-strong" />
          <span className="absolute inset-x-[16%] bottom-[10%] top-[8%] overflow-hidden rounded-xl bg-photo">
            {profile.portrait && (
              <img src={resolveAsset(profile.portrait)} alt="" className="absolute inset-x-0 bottom-0 h-[96%] w-full object-cover object-[50%_0%]" />
            )}
          </span>
          <span className="absolute right-0 top-[38%] h-5 w-5 rounded-full bg-accent" />
        </div>
      </div>

      <div className="grid gap-2.5 border-t border-line px-4 py-4 sm:grid-cols-[1.2fr_1fr]">
        <div className="card rounded-xl p-3">
          <span className="inline-flex rounded-full bg-accent px-2 py-0.5 text-[8.5px] font-medium text-accent-on">In progress</span>
          <p className="mt-2 text-[13px] font-semibold leading-tight tracking-[-0.01em] text-heading">Card heading</p>
          <p className="mt-1.5">Body text on a card, with chips below.</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {["Procurement", "Inventory", "ERP"].map((tool) => (
              <span key={tool} className="rounded-full border border-line px-2 py-0.5 text-[8.5px] text-heading">
                {tool}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="rounded-xl border border-line bg-surface p-3">
            <p className="font-semibold text-heading">Panel heading</p>
            <p className="mt-1">Panel and input text</p>
            <span className="mt-2 block rounded-md border border-line-strong bg-surface px-2 py-1 text-muted">Placeholder…</span>
            <p className="mt-1.5 text-danger">Error message</p>
          </div>
          <p className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted">
            <span>
              <span className="text-accent">03</span> — Muted label
            </span>
            <span className="text-accent">Accent</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ContrastReport({ report }) {
  return (
    <ul className="divide-y divide-heading/[0.07]">
      {report.results.map((result) => {
        const status = !result.passes ? "fail" : !result.meetsRecommended ? "warn" : "pass";
        return (
          <li key={`${result.fg}-${result.bg}`} className="flex items-center gap-3 py-2.5">
            <span
              aria-hidden="true"
              className="grid h-8 w-10 shrink-0 place-items-center rounded-md border border-heading/10 text-sm font-medium"
              style={{ background: result.bgHex, color: result.fgHex }}
            >
              Aa
            </span>
            <span className="min-w-0 flex-1 text-sm text-heading">{result.label}</span>
            <span className="font-mono text-[13px] text-body">{result.ratio.toFixed(2)}:1</span>
            {status === "pass" && <Badge tone="success">Pass</Badge>}
            {status === "warn" && <Badge tone="warning">Low</Badge>}
            {status === "fail" && <Badge tone="danger">Fail</Badge>}
          </li>
        );
      })}
    </ul>
  );
}

export default function ThemePage() {
  const toast = useToast();
  const { handleError } = useAuth();
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [profile, setProfile] = useState({});
  const [saving, setSaving] = useState(false);

  const fail = useCallback(
    (error) => {
      handleError(error);
      toast.error(error.message);
    },
    [handleError, toast]
  );

  useEffect(() => {
    adminApi
      .getSingleton(KEY)
      .then((data) => {
        const palette = resolveTheme(data);
        setSaved(palette);
        setDraft(palette);
      })
      .catch(fail);
    // Only used to make the preview look like the real site.
    adminApi
      .getSingleton("profile")
      .then(setProfile)
      .catch(() => {});
  }, [fail]);

  const report = useMemo(() => {
    if (!draft) return null;
    const result = checkThemeContrast(draft);
    result.results = result.results.map((item) => ({ ...item, fgHex: draft[item.fg], bgHex: draft[item.bg] }));
    return result;
  }, [draft]);

  const dirty = Boolean(draft && saved && !samePalette(draft, saved));

  // Warn before leaving the page with an unpublished palette.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Makes every failing pairing readable by adjusting only the text colours involved (fixThemeContrast):
  // lighter or darker, keeping their hue, just enough to pass. Backgrounds stay as chosen.
  const fixContrast = () => {
    const fixed = fixThemeContrast(draft);
    const changed = THEME_TOKENS.filter(({ key }) => fixed[key] !== draft[key]).map((token) => token.label.toLowerCase());
    setDraft(fixed);
    if (checkThemeContrast(fixed).errors.length) {
      toast.error("Some pairs can't be fixed by adjusting text colours alone — try different background colours.");
    } else {
      toast.success(`Adjusted ${changed.join(", ")} — every pairing is readable now. Review the preview, then publish.`);
    }
  };

  const publish = async () => {
    if (report.errors.length) {
      toast.error("Some colour pairs are too low-contrast — use “Fix contrast” first.");
      return;
    }
    setSaving(true);
    try {
      const palette = resolveTheme(await adminApi.saveSingleton(KEY, draft));
      setSaved(palette);
      setDraft(palette);
      toast.success("Palette published — the site now uses it.");
    } catch (error) {
      fail(error);
    } finally {
      setSaving(false);
    }
  };

  if (!draft) return <Spinner />;
  const savedPreset = presetFor(saved);
  const draftPreset = presetFor(draft);

  return (
    <div className="pb-28">
      <PageHeader
        title="Theme"
        description="Every colour on the public site comes from this palette. Changes are previewed here (and can be opened on the site) before you publish them."
        actions={
          <>
            <Button variant="secondary" icon={LuArrowUpRight} onClick={() => window.open(previewUrl(draft), "_blank", "noopener")}>
              Preview on site
            </Button>
            <Button
              variant="ghost"
              icon={LuRotateCcw}
              disabled={samePalette(draft, DEFAULT_THEME)}
              onClick={() => {
                setDraft(DEFAULT_THEME);
                toast.success("Default palette loaded — publish to apply it.");
              }}
            >
              Reset to default
            </Button>
          </>
        }
      />

      <p className="-mt-4 mb-8 text-sm text-body">
        Published: <span className="text-heading">{savedPreset ? savedPreset.name : "Custom palette"}</span>
        {savedPreset?.id === THEME_PRESETS[0].id && " (default)"}
      </p>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Panel>
            <h2 className="text-lg font-medium text-heading">Presets</h2>
            <p className="mt-1 text-sm text-body/80">Start from a preset — light or dark — then fine-tune below.</p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {THEME_PRESETS.map((preset, index) => {
                const active = draftPreset?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDraft(preset.colors)}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      active ? "border-heading bg-heading/[0.06]" : "border-heading/10 hover:border-heading/30"
                    }`}
                  >
                    <span className="flex overflow-hidden rounded-md border border-heading/10" aria-hidden="true">
                      {SWATCH_KEYS.map((key) => (
                        <span key={key} className="h-7 flex-1" style={{ background: preset.colors[key] }} />
                      ))}
                    </span>
                    <span className="mt-2.5 flex items-center gap-2 text-sm font-medium text-heading">
                      {preset.name}
                      {index === 0 && <Badge>Default</Badge>}
                      {active && <LuCheck className="ml-auto h-4 w-4" aria-hidden="true" />}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-body/80">{preset.description}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {GROUPS.map((group) => (
            <Panel key={group}>
              <h2 className="text-lg font-medium text-heading">{group}</h2>
              <div className="mt-5 space-y-4">
                {THEME_TOKENS.filter((token) => token.group === group).map((token) => (
                  <div key={token.key} className="flex flex-wrap items-center justify-between gap-3">
                    <label htmlFor={`theme-${token.key}`} className="text-sm text-heading">
                      {token.label}
                      {draft[token.key] !== saved[token.key] && <span className="ml-2 text-[12px] text-accent">changed</span>}
                    </label>
                    <ColorInput
                      id={`theme-${token.key}`}
                      label={token.label}
                      value={draft[token.key]}
                      onChange={(hex) => setDraft((current) => ({ ...current, [token.key]: hex }))}
                    />
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-heading">Live preview</h2>
              {dirty ? <Badge tone="warning">Unpublished</Badge> : <Badge>Published</Badge>}
            </div>
            <p className="mt-1 text-sm text-body/80">Updates as you edit. Nothing changes on the site until you publish.</p>
            <div className="mt-5">
              <ThemePreview palette={draft} profile={profile} />
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-heading">Readability</h2>
              {report.errors.length > 0 ? (
                <Badge tone="danger">{report.errors.length} to fix</Badge>
              ) : report.warnings.length > 0 ? (
                <Badge tone="warning">{report.warnings.length} low</Badge>
              ) : (
                <Badge tone="success">All clear</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-body/80">
              WCAG contrast for every text and background pairing the site uses. Failing pairs block publishing; “Low”
              pairs are allowed for large or secondary text.
            </p>
            {report.errors.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/40 bg-danger/10 p-3">
                <p className="min-w-0 flex-1 text-sm text-heading">
                  Too low-contrast to publish: {report.errors.map((error) => error.label.toLowerCase()).join(", ")}.
                </p>
                <Button icon={LuWandSparkles} onClick={fixContrast}>
                  Fix contrast
                </Button>
              </div>
            )}
            <div className="mt-3">
              <ContrastReport report={report} />
            </div>
          </Panel>
        </div>
      </div>

      <AnimatePresence>
        {dirty && (
          <motion.div
            className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-heading/15 bg-surface-raised px-5 py-3 shadow-2xl lg:left-[calc(260px+2rem)]"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
          >
            <span className="flex items-center gap-2 text-sm text-body">
              {report.errors.length > 0 && <LuTriangleAlert className="h-4 w-4 text-danger" aria-hidden="true" />}
              {report.errors.length > 0
                ? `${report.errors.length} colour ${report.errors.length === 1 ? "pair is" : "pairs are"} hard to read`
                : "Unpublished palette"}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setDraft(saved)} disabled={saving}>
                Discard
              </Button>
              {/* An unreadable palette can't be published, so the main action fixes it first */}
              {report.errors.length > 0 ? (
                <Button icon={LuWandSparkles} onClick={fixContrast}>
                  Fix contrast
                </Button>
              ) : (
                <Button icon={LuUpload} loading={saving} onClick={publish}>
                  Publish
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
