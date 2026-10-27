import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { EASE_OUT, SPRING_UI } from "../lib/motion";
import Reveal from "./ui/Reveal";
import SectionHeader from "./ui/SectionHeader";

function FaqItem({ item, open, onToggle }) {
  const id = useId();
  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-button`}
          className="flex w-full items-center justify-between gap-6 py-5 text-left text-[1.0625rem] font-semibold text-heading md:py-6"
        >
          {item.question}
          <motion.span animate={{ rotate: open ? 45 : 0 }} transition={SPRING_UI} className="shrink-0">
            <LuPlus aria-hidden="true" className="h-5 w-5" />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="copy max-w-2xl pb-7 pr-10">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Questions and answers as a ruled accordion beside the section title. */
const FAQ = ({ section, index }) => {
  const { faqs } = useContent();
  const [openId, setOpenId] = useState(faqs[0]?.id ?? null);
  if (!faqs.length) return null;

  return (
    <section id="faq" aria-labelledby="faq-title" className="section-y">
      <div className="container-site grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
        <SectionHeader section={section} index={index} id="faq-title" className="lg:sticky lg:top-28 lg:col-span-5" />
        <Reveal className="border-t border-line lg:col-span-7">
          {faqs.map((item) => (
            <FaqItem key={item.id} item={item} open={openId === item.id} onToggle={() => setOpenId(openId === item.id ? null : item.id)} />
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default FAQ;
