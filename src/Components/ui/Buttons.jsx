import { Link } from "react-router-dom";
import { isExternal } from "../../lib/text";

const VARIANTS = { outline: "btn-outline", primary: "btn-primary", quiet: "btn-quiet" };

/**
 * Pill button in the reference's style (outlined "Get in touch").
 * Renders a router <Link> (to), an anchor (href) or a <button>. `size="sm"` is the compact card variant.
 */
export function Button({
  to,
  href,
  children,
  icon: Icon,
  leadingIcon: LeadingIcon,
  variant = "outline",
  size = "md",
  className = "",
  ...rest
}) {
  const classes = `btn ${size === "sm" ? "btn-sm" : ""} ${VARIANTS[variant]} ${className}`;
  const content = (
    <>
      {LeadingIcon && <LeadingIcon aria-hidden="true" className="h-[1.15em] w-[1.15em] shrink-0" />}
      {children}
      {Icon && <Icon aria-hidden="true" className="h-[1.15em] w-[1.15em] shrink-0" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    const external = isExternal(href);
    return (
      <a href={href} className={classes} {...(external && { target: "_blank", rel: "noopener noreferrer" })} {...rest}>
        {content}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}

/** Four joined dots — the small mark the reference uses on its call-to-action buttons. */
export function NodesIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="4.5" r="2.5" fill="currentColor" />
      <circle cx="12" cy="19.5" r="2.5" fill="currentColor" />
      <circle cx="4.5" cy="12" r="2.5" fill="currentColor" />
      <circle cx="19.5" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}
