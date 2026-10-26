/**
 * Label that "rolls" on hover (reference interaction): the text slides up out of view while a copy
 * rises from below. The copy repeats the label unless `copy` gives a different text (e.g. the logo
 * "Munna" → "QA x DEV"). The nearest `.roll-host` ancestor (a link, a list row…) triggers it — see index.css.
 */
export default function RollText({ children, copy, className = "", copyClassName = "" }) {
  return (
    <span className={`roll ${className}`}>
      <span className="roll-line">{children}</span>
      <span aria-hidden="true" className={`roll-line roll-copy ${copyClassName}`}>
        {copy || children}
      </span>
    </span>
  );
}
