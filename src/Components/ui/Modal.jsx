import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useLockBodyScroll } from "../../hooks/useScrollState";
import { EASE_OUT, SPRING_SOFT } from "../../lib/motion";

/** Accessible dialog: focus trap, Escape to close, scroll lock and focus restore. */
export default function Modal({ open, onClose, labelledBy, children, className = "" }) {
  const panelRef = useRef(null);
  useLockBodyScroll(open);
  useFocusTrap(panelRef, open, onClose);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-canvas/75 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className={`relative max-h-[92svh] w-full overflow-y-auto overscroll-contain rounded-t-[24px] border border-line bg-surface shadow-2xl outline-none sm:rounded-[24px] ${className}`}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            // Closing should feel instant: a short tween rather than the slow-settling entrance spring.
            exit={{ opacity: 0, y: 30, transition: { duration: 0.22, ease: EASE_OUT } }}
            transition={SPRING_SOFT}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full bg-surface-raised text-heading transition-colors hover:bg-button hover:text-button-text"
            >
              <LuX aria-hidden="true" className="h-[18px] w-[18px]" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
