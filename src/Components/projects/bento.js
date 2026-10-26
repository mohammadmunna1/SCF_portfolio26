// The Bento arrangement of the project showcase: which cells each card spans, from tablets up.
// Desktop rows alternate a wide and a narrow card (7 · 5, then 5 · 7), then two halves (6 · 6), and repeat;
// tablets alternate one full-width card with a pair. A card left alone at the end takes the whole row
// (laid out side by side: preview left, details right). Phones show one card per row.

const LG_ROWS = [
  [7, 5],
  [5, 7],
  [6, 6],
];
const MD_ROWS = [[12], [6, 6]];

// Full class names, so Tailwind can find them
const MD_SPAN = { 12: "md:col-span-12", 6: "md:col-span-6" };
const LG_SPAN = { 12: "lg:col-span-12", 7: "lg:col-span-7", 6: "lg:col-span-6", 5: "lg:col-span-5" };

function spans(count, rows) {
  const result = [];
  for (let row = 0; result.length < count; row++) {
    const template = rows[row % rows.length];
    const left = count - result.length;
    result.push(...(left >= template.length ? template : Array(left).fill(12)));
  }
  return result;
}

/**
 * One entry per card: `className` (its grid spans), whether it's laid out side by side on tablets
 * (`wideMd`) or desktops (`wideLg`), and whether it's one of the emphasised, larger cards (`large`).
 */
export function bentoCells(count) {
  const md = spans(count, MD_ROWS);
  const lg = spans(count, LG_ROWS);
  return md.map((mdSpan, index) => ({
    className: `${MD_SPAN[mdSpan]} ${LG_SPAN[lg[index]]}`,
    wideMd: mdSpan === 12,
    wideLg: lg[index] === 12,
    large: lg[index] >= 7,
  }));
}

/**
 * Classes for a Bento card's parts, from its cell: the card itself, its preview (same height for every
 * card in a desktop row, or a column beside the details in a full-width card) and the details.
 */
export function bentoClasses(cell) {
  if (!cell) return null;
  return {
    card: [
      "card h-full p-3",
      cell.wideMd ? "md:flex-row" : "md:flex-col",
      cell.wideLg ? "lg:flex-row" : "lg:flex-col",
    ].join(" "),
    preview: [
      cell.wideMd ? "md:w-[54%] md:shrink-0 md:self-stretch md:min-h-[17rem]" : "md:h-[15rem] md:w-full",
      cell.wideLg ? "lg:h-auto lg:w-[54%] lg:shrink-0 lg:self-stretch lg:min-h-[18rem]" : "lg:h-[18rem] lg:w-full xl:h-[20rem]",
    ].join(" "),
    details: [
      "px-2 pb-2 pt-4",
      cell.wideMd ? "md:pl-5 md:pt-2" : "md:pl-2 md:pt-4",
      cell.wideLg ? "lg:pl-6 lg:pt-3" : "lg:pl-2 lg:pt-4",
    ].join(" "),
    title: cell.large ? "lg:text-[1.75rem] xl:text-[2rem]" : "",
  };
}
