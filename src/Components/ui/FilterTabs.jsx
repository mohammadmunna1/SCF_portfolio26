import { motion } from "framer-motion";
import { SPRING_UI } from "../../lib/motion";

/** Segmented pill filter. `items`: [{ key, label, count? }] */
export default function FilterTabs({ items, value, onChange, label, layoutId, className = "" }) {
  return (
    <div role="group" aria-label={label} className={`inline-flex flex-wrap gap-1 rounded-[22px] bg-surface-raised p-1 ${className}`}>
      {items.map((item) => {
        const selected = value === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            aria-pressed={selected}
            className={`caps relative h-9 rounded-full px-4 transition-colors duration-300 ${
              selected ? "text-button-text" : "text-heading hover:text-heading/75"
            }`}
          >
            {selected && (
              <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-button" transition={SPRING_UI} />
            )}
            <span className="relative">
              {item.label}
              {item.count !== undefined && <span className="ml-1.5 opacity-70">{item.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
