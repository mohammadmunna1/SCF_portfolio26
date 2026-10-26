import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { LuCircleCheck, LuTriangleAlert, LuX } from "react-icons/lu";

const ToastContext = createContext(null);
let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const show = useCallback(
    (message, tone = "success") => {
      const id = ++nextId;
      setToasts((current) => [...current.slice(-3), { id, message, tone }]);
      setTimeout(() => dismiss(id), tone === "error" ? 6000 : 3500);
    },
    [dismiss]
  );
  const api = useMemo(() => ({ success: (m) => show(m, "success"), error: (m) => show(m, "error") }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Top-centre, so toasts never cover a drawer's Save button or other primary actions */}
      <div aria-live="polite" className="pointer-events-none fixed left-1/2 top-4 z-[120] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl ${
                toast.tone === "error" ? "border-danger/40 bg-surface-raised text-heading" : "border-heading/15 bg-surface-raised text-heading"
              }`}
            >
              {toast.tone === "error" ? (
                <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
              ) : (
                <LuCircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span className="flex-1">{toast.message}</span>
              <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
                <LuX className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
