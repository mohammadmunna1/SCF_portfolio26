import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { BrowserFrame } from "./ProjectParts";
import { CodeWindow } from "./SqaCard";

// How much the card in focus grows, and its neighbour gives way — less on smaller desktops, so the
// narrower card's text never has to re-wrap (it keeps a fixed width; see CategoryCard).
const GROW = { lg: [1.14, 0.86], xl: [1.3, 0.7] };
const FOCUS_SPRING = { type: "spring", stiffness: 240, damping: 28, mass: 0.9 };
// The card making room settles with a small, restrained bounce
const MAKE_ROOM_SPRING = { type: "spring", stiffness: 320, damping: 15, mass: 0.7 };

/** The SQA visual: code windows from the repositories, layered; the front one lifts while in focus. */
function CodeStack({ projects, focused }) {
  const [front, back] = projects.filter((project) => project.snippet);
  if (!front) return null;
  return (
    <>
      {back && (
        <motion.div
          className="absolute right-[-6%] top-[6%] h-[78%] w-[76%] overflow-hidden rounded-2xl border border-line opacity-80"
          animate={{ x: focused ? 10 : 0 }}
          transition={FOCUS_SPRING}
        >
          <CodeWindow project={back} />
        </motion.div>
      )}
      <motion.div
        className="absolute bottom-[-10%] left-0 h-[78%] w-[80%] overflow-hidden rounded-2xl border border-line-strong/60 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.45)]"
        animate={{ y: focused ? -8 : 0 }}
        transition={FOCUS_SPRING}
      >
        <CodeWindow project={front} />
      </motion.div>
    </>
  );
}

/** The development visual: project screenshots in browser windows, fanned out a little more while in focus. */
function ScreenshotFan({ projects, focused }) {
  const shots = projects.filter((project) => project.image).slice(0, 3);
  return shots.map((project, index) => (
    <motion.div
      key={project.id}
      className="absolute w-[68%] overflow-hidden rounded-xl border border-line-strong/60 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.45)]"
      style={{ left: `${index * 16}%`, top: `${index * 15}%`, zIndex: index }}
      animate={{ x: focused ? (index - 1) * 14 : 0, y: focused ? -index * 4 : 0 }}
      transition={FOCUS_SPRING}
    >
      <BrowserFrame src={project.image} url={project.liveUrl} title={project.title} />
    </motion.div>
  ));
}

const VISUALS = { sqa: CodeStack, dev: ScreenshotFan };

/**
 * One category: its own section's label, title and introduction (Admin → Sections), how many projects
 * it holds and the tools that recur in them, over a visual made from the projects themselves. The whole
 * card is one button (stretched over it from the title) that opens the category's showcase.
 */
function CategoryCard({ category, state, expand, grow, onFocusChange, onSelect }) {
  const Visual = VISUALS[category.kind];
  const focused = state === "focus";
  const flexGrow = expand ? { idle: 1, focus: grow[0], aside: grow[1] }[state] : 1;

  return (
    <motion.article
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-line bg-surface transition-colors duration-300 hover:border-line-strong has-[:focus-visible]:border-heading md:h-[32rem] md:basis-0 xl:h-[34rem]"
      style={{ flexGrow: 1 }}
      animate={{ flexGrow, scale: state === "aside" && expand ? 0.985 : 1 }}
      transition={state === "aside" ? MAKE_ROOM_SPRING : FOCUS_SPRING}
      onHoverStart={() => onFocusChange(category.key)}
      onHoverEnd={() => onFocusChange(null)}
      onTapStart={() => onFocusChange(category.key)}
      onTapCancel={() => onFocusChange(null)}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center justify-between gap-4 px-6 pt-6 md:px-7 md:pt-7">
        <p className="meta text-body">{category.eyebrow}</p>
        <p className="meta shrink-0 text-muted">
          {category.count} {category.count === 1 ? "project" : "projects"}
        </p>
      </div>

      {/* The visual fades out towards the text instead of being cut off at its edge */}
      <div
        aria-hidden="true"
        className="relative mx-6 mt-6 h-44 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_70%,transparent)] sm:h-52 md:mx-7 md:h-auto md:min-h-0 md:flex-1"
      >
        <Visual projects={category.projects} focused={focused} />
      </div>

      {/* Not positioned, so the title button's overlay (`after:`) covers the whole card */}
      <div className="px-6 pb-6 pt-6 md:px-7 md:pb-7">
        {/* A fixed width, so the text doesn't re-wrap while the card grows or gives way */}
        <div className="w-full max-w-[21rem]">
          <h3 className="display text-[clamp(2.5rem,3.6vw,3.5rem)] !leading-[0.95]">
            <button
              type="button"
              onClick={() => onSelect(category.key)}
              onFocus={(event) => event.target.matches(":focus-visible") && onFocusChange(category.key)}
              onBlur={() => onFocusChange(null)}
              className="text-left after:absolute after:inset-0 after:z-20 after:rounded-[24px] focus-visible:outline-none"
            >
              {category.title}
              <span className="sr-only">
                {" "}
                — {category.count} projects. Show them.
              </span>
            </button>
          </h3>
          {category.intro && <p className="copy-card mt-3 text-body md:line-clamp-3">{category.intro}</p>}
        </div>
        {/* On desktops, where the cards resize, one line: tags that no longer fit fade out rather than wrapping */}
        <div className="mt-5 flex items-center gap-3">
          <ul
            aria-label="Main tools"
            className="flex min-w-0 flex-1 flex-wrap gap-1.5 lg:mask-fade-right lg:flex-nowrap lg:overflow-hidden"
          >
            {category.tags.map((tag) => (
              <li key={tag} className="chip-line chip-sm shrink-0">
                {tag}
              </li>
            ))}
          </ul>
          <span
            aria-hidden="true"
            className="btn btn-sm btn-outline shrink-0 group-hover:border-button group-hover:bg-button group-hover:text-button-text"
          >
            Explore
            <LuArrowRight className="h-[1.15em] w-[1.15em] transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * The two categories of work as equally sized cards, side by side from tablets up. With a mouse, the
 * card under the pointer (or with keyboard focus) grows while the other gives way with a light spring;
 * on touch screens the pressed card does, and a tap opens it. Reduced motion keeps them still.
 */
export default function CategoryPicker({ categories, onSelect }) {
  const [focus, setFocus] = useState(null);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const wide = useMediaQuery("(min-width: 1280px)");
  const reduceMotion = useReducedMotion();
  const expand = desktop && !reduceMotion;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-5 xl:gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.key}
          category={category}
          state={focus === category.key ? "focus" : focus ? "aside" : "idle"}
          expand={expand}
          grow={wide ? GROW.xl : GROW.lg}
          onFocusChange={setFocus}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
