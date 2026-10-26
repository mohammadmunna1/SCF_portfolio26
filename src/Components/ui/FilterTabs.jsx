import { motion } from "framer-motion";
import { SPRING_UI } from "../../lib/motion";

/**
 * Segmented pill filter. `items`: [{ key, label, count? }]. Stays on one line: when it's wider than the
 * screen it scrolls sideways (without a scrollbar) instead of wrapping into a block.
 */
export default function FilterTabs({ items, value, onChange, label, layoutId, className = "" }) {
  return (
    <div className={`no-scrollbar max-w-full overflow-x-auto rounded-[1.375rem] ${className}`}>
      <div role="group" aria-label={label} className="inline-flex gap-1 rounded-[1.375rem] border border-line bg-surface-raised p-1">
        {items.map((item) => {
          const selected = value === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              aria-pressed={selected}
              className={`relative h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-[0.875rem] font-medium transition-colors duration-200 ${
                selected ? "text-button-text" : "text-body hover:text-heading"
              }`}
            >
              {selected && (
                <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-button" transition={SPRING_UI} />
              )}
              <span className="relative">
                {item.label}
                {item.count !== undefined && <span className="ml-1.5 tabular-nums opacity-60">{item.count}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
