import { useId, useRef, useState } from "react";
import { LuImagePlus, LuLink, LuTrash2, LuX } from "react-icons/lu";
import { ICON_OPTIONS } from "../../shared/schema.js";
import { normalizeHex } from "../../shared/theme.js";
import { resolveAsset } from "../lib/api";
import { getIcon } from "../lib/icons";
import { adminApi } from "./api";
import { compressImage } from "./imageCompress";
import { useToast } from "./Toast";
import { Button, Switch } from "./ui";

export const inputClass =
  "w-full rounded-lg border border-heading/10 bg-canvas px-3.5 py-2.5 text-[15px] text-heading placeholder:text-muted transition-colors focus:border-heading/40 focus:outline-none aria-[invalid=true]:border-danger/70";

function TagInput({ id, value = [], onChange, invalid }) {
  const [draft, setDraft] = useState("");
  const add = (text) => {
    const additions = text
      .split(/[,\n]/)
      .map((entry) => entry.trim())
      .filter((entry) => entry && !value.includes(entry));
    if (additions.length) onChange([...value, ...additions]);
    setDraft("");
  };

  return (
    <div
      className={`flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-lg border bg-canvas p-1.5 focus-within:border-heading/40 ${
        invalid ? "border-danger/70" : "border-heading/10"
      }`}
    >
      {value.map((tag, index) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-heading/10 py-1 pl-2.5 pr-1 text-sm text-heading">
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="rounded p-0.5 text-body hover:bg-heading/10 hover:text-heading"
          >
            <LuX className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add(draft);
          } else if (event.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft && add(draft)}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text");
          if (/[,\n]/.test(text)) {
            event.preventDefault();
            add(text);
          }
        }}
        placeholder={value.length ? "Add more…" : "Type and press Enter"}
        className="min-w-[8rem] flex-1 bg-transparent px-2 py-1.5 text-[15px] text-heading placeholder:text-muted focus:outline-none"
      />
    </div>
  );
}

const parseLines = (text) =>
  String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/** Longer items (bullet points), edited one per line. Blank lines are ignored when saving. */
function ListInput({ value, onChange, rows = 5, ...common }) {
  const items = Array.isArray(value) ? value : [];
  const [text, setText] = useState(() => items.join("\n"));
  const [synced, setSynced] = useState(value);
  // Follow outside changes (e.g. "Discard"), but never reformat what's being typed.
  if (value !== synced) {
    setSynced(value);
    if (JSON.stringify(parseLines(text)) !== JSON.stringify(items)) setText(items.join("\n"));
  }

  return (
    <>
      <textarea
        {...common}
        rows={Math.max(rows, items.length + 1)}
        value={text}
        onChange={(event) => {
          const next = parseLines(event.target.value);
          setText(event.target.value);
          setSynced(next);
          onChange(next);
        }}
        placeholder="One point per line"
        className={`${inputClass} resize-y leading-relaxed`}
      />
      <p className="mt-1.5 text-[13px] text-body/80">
        {items.length} {items.length === 1 ? "point" : "points"}
      </p>
    </>
  );
}

/** Colour picker plus a HEX text box. Only valid colours are passed on, so live previews never break. */
export function ColorInput({ id, value, onChange, label, describedBy }) {
  const [text, setText] = useState(value || "");
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    if (normalizeHex(text) !== normalizeHex(value)) setText(value || "");
  }
  const valid = Boolean(normalizeHex(text));

  const update = (raw) => {
    setText(raw);
    const hex = normalizeHex(raw);
    if (hex && hex !== value) {
      setSynced(hex);
      onChange(hex);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label
        className="relative h-10 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-heading/20"
        style={{ background: normalizeHex(value) || "transparent" }}
      >
        <span className="sr-only">{label}: pick a colour</span>
        <input
          type="color"
          value={(normalizeHex(value) || "#000000").toLowerCase()}
          onChange={(event) => update(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <input
        id={id}
        value={text}
        onChange={(event) => update(event.target.value)}
        onBlur={() => !valid && setText(value || "")}
        spellCheck={false}
        autoComplete="off"
        maxLength={7}
        aria-label={`${label} (hex)`}
        aria-invalid={!valid}
        aria-describedby={describedBy}
        className={`${inputClass} w-[7.5rem] font-mono uppercase`}
      />
    </div>
  );
}

function ImageField({ id, value, onChange, invalid }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const toast = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const blob = await compressImage(file);
      const { url } = await adminApi.upload(blob, file.name);
      onChange(url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={`flex flex-col gap-4 rounded-xl border border-dashed p-3 sm:flex-row sm:items-center ${
          invalid ? "border-danger/70" : "border-heading/15"
        }`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <div className="grid aspect-[4/3] w-full shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-raised sm:w-40">
          {value ? (
            <img src={resolveAsset(value)} alt="" className="h-full w-full object-contain" />
          ) : (
            <LuImagePlus className="h-7 w-7 text-body/40" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-sm text-body/80">Drop an image here or upload one. It’s resized and converted to WebP automatically.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" loading={uploading} icon={LuImagePlus} onClick={() => inputRef.current?.click()}>
              {value ? "Replace" : "Upload"}
            </Button>
            <Button variant="ghost" icon={LuLink} onClick={() => setShowUrl((open) => !open)}>
              Use a URL
            </Button>
            {value && (
              <Button variant="ghost" icon={LuTrash2} onClick={() => onChange("")}>
                Remove
              </Button>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>
      {(showUrl || (value && !value.startsWith("/api/"))) && (
        <input
          id={id}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://… or /images/…"
          aria-invalid={invalid}
          className={inputClass}
        />
      )}
    </div>
  );
}

function IconPicker({ value, onChange, labelId }) {
  return (
    <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
      {ICON_OPTIONS.map((key) => {
        const Icon = getIcon(key);
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={key}
            title={key}
            onClick={() => onChange(key)}
            className={`grid aspect-square place-items-center rounded-lg border transition-colors ${
              selected ? "border-button bg-button text-button-text" : "border-heading/10 text-body hover:border-heading/30 hover:text-heading"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

/** Renders the right control for a schema field, with label, help text and error. */
export function Field({ field, value, onChange, error }) {
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const invalid = Boolean(error);
  const common = { id, "aria-invalid": invalid, "aria-describedby": invalid ? errorId : undefined };
  const options = (field.options || []).map((option) => (typeof option === "string" ? { value: option, label: option } : option));

  let control;
  switch (field.type) {
    case "textarea":
      control = (
        <textarea
          {...common}
          rows={field.rows || 4}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      );
      break;
    case "number":
      control = (
        <input
          {...common}
          type="number"
          min={field.min}
          max={field.max}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))}
          className={`${inputClass} max-w-[10rem]`}
        />
      );
      break;
    case "boolean":
      control = (
        <div className="flex items-center gap-3">
          <Switch id={id} checked={Boolean(value)} onChange={onChange} label={field.label} />
          <span className="text-sm text-body">{value ? "On" : "Off"}</span>
        </div>
      );
      break;
    case "select":
      control = (
        <select {...common} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className={inputClass}>
          {!field.required && <option value="">—</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
    case "icon":
      control = <IconPicker value={value} onChange={onChange} labelId={labelId} />;
      break;
    case "tags":
      control = <TagInput id={id} value={value || []} onChange={onChange} invalid={invalid} />;
      break;
    case "list":
      control = <ListInput {...common} value={value} onChange={onChange} rows={field.rows} />;
      break;
    case "color":
      control = <ColorInput id={id} value={value} onChange={onChange} label={field.label} describedBy={invalid ? errorId : undefined} />;
      break;
    case "image":
      control = <ImageField id={id} value={value} onChange={onChange} invalid={invalid} />;
      break;
    default:
      control = field.readOnly ? (
        <p className="rounded-lg border border-heading/5 bg-heading/[0.03] px-3.5 py-2.5 text-[15px] text-body">{value}</p>
      ) : (
        <input
          {...common}
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder || (field.type === "url" ? "https://" : undefined)}
          className={inputClass}
        />
      );
  }

  return (
    <div>
      <label
        id={labelId}
        htmlFor={["icon", "boolean"].includes(field.type) ? undefined : id}
        className="mb-2 flex items-baseline gap-1 text-sm font-medium text-heading"
      >
        {field.label || field.name}
        {field.required && <span className="text-body/70" aria-hidden="true">*</span>}
      </label>
      {control}
      {field.help && !invalid && <p className="mt-1.5 text-[13px] text-body/80">{field.help}</p>}
      {invalid && (
        <p id={errorId} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Renders a list of schema fields bound to a values object.
 * `onFieldChange(name, value)` lets the parent apply updates functionally, so a slow
 * upload finishing later can't overwrite edits made to other fields in the meantime.
 */
export function FieldList({ fields, values, onFieldChange, errors = {} }) {
  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <Field
          key={field.name}
          field={field}
          value={values[field.name]}
          error={errors[field.name]}
          onChange={(next) => onFieldChange(field.name, next)}
        />
      ))}
    </div>
  );
}
