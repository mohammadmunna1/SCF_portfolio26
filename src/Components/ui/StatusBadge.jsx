import { LuCalendarClock, LuCircleCheck, LuLoaderCircle } from "react-icons/lu";

const STATUSES = {
  completed: { label: "Completed", icon: LuCircleCheck, className: "border border-line-strong bg-surface-raised text-heading" },
  ongoing: { label: "In progress", icon: LuLoaderCircle, className: "border border-accent bg-accent text-accent-on" },
  planned: { label: "Planned", icon: LuCalendarClock, className: "border border-dashed border-line-strong bg-surface-raised text-body" },
};

/** Completed, in progress or planned — always spelled out with its own icon, never shown by colour alone. */
export default function StatusBadge({ status = "completed", className = "" }) {
  const { label, icon: Icon, className: tone } = STATUSES[status] || STATUSES.completed;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium leading-5 ${tone} ${className}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
