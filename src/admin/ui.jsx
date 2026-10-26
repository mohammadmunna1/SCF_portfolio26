import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LuLoaderCircle, LuX } from "react-icons/lu";
import { useLockBodyScroll } from "../hooks/useScrollState";

const VARIANTS = {
  primary: "bg-button text-button-text hover:bg-button/85",
  secondary: "border border-heading/15 bg-heading/[0.03] text-heading hover:border-heading/30 hover:bg-heading/[0.07]",
  danger: "border border-danger/30 text-danger hover:bg-danger/10",
  ghost: "text-body hover:bg-heading/[0.06] hover:text-heading",
};

export function Button({ variant = "primary", loading = false, icon: Icon, children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <LuLoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function IconButton({ label, icon: Icon, className = "", ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-body transition-colors hover:bg-heading/[0.08] hover:text-heading disabled:opacity-30 ${className}`}
      {...rest}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
    </button>
  );
}

export const Spinner = ({ label = "Loading" }) => (
  <div role="status" className="flex items-center justify-center gap-3 py-16 text-body">
    <LuLoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
    {label}…
  </div>
);

export function Switch({ checked, onChange, label, id }) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-button" : "bg-heading/15"}`}
    >
      <motion.span
        initial={false}
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`ml-0.5 h-5 w-5 rounded-full ${checked ? "bg-button-text" : "bg-heading"}`}
      />
    </button>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[1.75rem] font-normal leading-tight tracking-[-0.02em] text-heading md:text-[2rem]">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-[15px] text-body">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Rounded panel used for groups of settings. */
export function Panel({ as: Tag = "section", className = "", children, ...rest }) {
  return (
    <Tag className={`rounded-2xl border border-heading/[0.07] bg-surface p-5 md:p-7 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

const BADGE_TONES = {
  neutral: "bg-heading/[0.06] text-body",
  info: "bg-heading/15 text-heading",
  warning: "bg-accent/15 text-accent",
  success: "bg-heading/[0.08] text-heading",
  danger: "bg-danger/15 text-danger",
};

export const Badge = ({ children, tone = "neutral" }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${BADGE_TONES[tone]}`}>
    {children}
  </span>
);

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Shared overlay behaviour for the drawer and dialogs: focus trap, Escape, scroll lock. */
function useOverlay(open, onClose, panelRef) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const panel = panelRef.current;
    const focusables = () => [...panel.querySelectorAll(FOCUSABLE)].filter((el) => !el.closest("[inert]"));
    requestAnimationFrame(() => (panel.querySelector("[data-autofocus]") || focusables()[0] || panel).focus());
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
      } else if (event.key === "Tab") {
        const items = focusables();
        if (!items.length) return;
        if (event.shiftKey && document.activeElement === items[0]) {
          event.preventDefault();
          items[items.length - 1].focus();
        } else if (!event.shiftKey && document.activeElement === items[items.length - 1]) {
          event.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [open, panelRef]);
}

/** Slide-over panel used for editing items. */
export function Drawer({ open, onClose, title, children, footer }) {
  const panelRef = useRef(null);
  useOverlay(open, onClose, panelRef);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-canvas/75 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-heading/10 bg-surface shadow-2xl outline-none"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
          >
            <header className="flex items-center justify-between gap-4 border-b border-heading/10 px-5 py-4 md:px-7">
              <h2 className="truncate text-lg font-medium text-heading">{title}</h2>
              <IconButton label="Close" icon={LuX} onClick={onClose} />
            </header>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 md:px-7">{children}</div>
            {footer && <footer className="flex justify-end gap-2 border-t border-heading/10 px-5 py-4 md:px-7">{footer}</footer>}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Confirmation dialog for destructive actions. */
export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", tone = "danger", onConfirm, onCancel, loading }) {
  const panelRef = useRef(null);
  useOverlay(open, onCancel, panelRef);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[110] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-canvas/80" onClick={onCancel} aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            tabIndex={-1}
            className="relative w-full max-w-md rounded-2xl border border-heading/10 bg-surface p-6 shadow-2xl outline-none"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <h2 id="confirm-title" className="text-lg font-medium text-heading">
              {title}
            </h2>
            <p id="confirm-message" className="mt-2 text-[15px] text-body">
              {message}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={onCancel} data-autofocus>
                Cancel
              </Button>
              <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
