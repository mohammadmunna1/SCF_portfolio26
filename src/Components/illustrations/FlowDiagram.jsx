import { LuChevronRight } from "react-icons/lu";
import { getKeywordIcon } from "../../lib/icons";
import { twoDigits } from "../../lib/text";

const SIZES = {
  md: { node: "h-11 w-11", icon: "h-5 w-5", center: "1.375rem", label: "text-[0.875rem]", number: "text-[0.6875rem]" },
  sm: { node: "h-9 w-9", icon: "h-4 w-4", center: "1.125rem", label: "text-[0.75rem]", number: "text-[0.625rem]" },
};

/**
 * A process drawn from its steps ("Order placed", "Stock deducted"…) as stops on a route: numbered,
 * each with an icon picked from its wording, joined by a dashed line with small arrows between them.
 */
export default function FlowDiagram({ steps = [], size = "md", className = "" }) {
  if (!steps.length) return null;
  const s = SIZES[size];
  const half = `${50 / steps.length}%`; // centre of the first and last column

  return (
    <ol aria-label="Workflow" className={`relative grid ${className}`} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      <span
        aria-hidden="true"
        className="absolute border-t border-dashed border-line-strong"
        style={{ left: half, right: half, top: `calc(${size === "md" ? "1.25rem" : "1rem"} + ${s.center})` }}
      />
      {steps.map((step, index) => {
        const Icon = getKeywordIcon(step);
        return (
          <li key={`${step}-${index}`} className="relative flex flex-col items-center px-1 text-center">
            <span className={`eyebrow block leading-4 ${s.number} ${size === "md" ? "h-5" : "h-4"}`}>{twoDigits(index + 1)}</span>
            <span
              className={`relative grid shrink-0 place-items-center rounded-full border shadow-sm ${s.node} ${
                index === steps.length - 1 ? "border-accent bg-accent text-accent-on" : "border-line bg-surface-raised text-heading"
              }`}
            >
              <Icon aria-hidden="true" className={s.icon} />
            </span>
            {index < steps.length - 1 && (
              <LuChevronRight
                aria-hidden="true"
                className="absolute left-full h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-accent"
                style={{ top: `calc(${size === "md" ? "1.25rem" : "1rem"} + ${s.center})` }}
              />
            )}
            <span className={`mt-2.5 block text-balance font-medium leading-snug text-heading ${s.label}`}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
