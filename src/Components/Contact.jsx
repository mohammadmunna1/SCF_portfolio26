import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { LuArrowUpRight, LuDownload, LuMail, LuMapPin, LuPhone } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { apiFetch } from "../lib/api";
import { cvLinkProps } from "../lib/text";
import { Button, NodesIcon } from "./ui/Buttons";
import Reveal from "./ui/Reveal";
import SectionHeader from "./ui/SectionHeader";

// Public Web3Forms key used by the original contact form (safe to expose by design).
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "f6032443-831b-4e75-8cf4-0ac17c74c161";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY = { name: "", email: "", message: "", website: "" };

const sendViaWeb3Forms = async (form) => {
  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: "New Contact Submission",
      from_name: "Website Contact Form",
      name: form.name,
      email: form.email,
      message: form.message,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) throw new Error(result.message || "Web3Forms error");
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Please enter your name.";
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = "Please enter a valid email address.";
  if (!form.message.trim()) errors.message = "Please write a message.";
  return errors;
}

const Field = ({ id, label, error, children }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-[0.875rem] font-medium text-heading">
      {label} <span aria-hidden="true" className="text-accent">*</span>
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} className="mt-2 text-sm text-danger">
        {error}
      </p>
    )}
  </div>
);

const CONTACT_ICONS = { Email: LuMail, Phone: LuPhone, Location: LuMapPin };

/** Contact details and a message form. Messages land in the admin inbox and are emailed via Web3Forms. */
const Contact = ({ section, index }) => {
  const { profile, socials } = useContent();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus({ state: "sending", message: "" });
    const payload = { ...form, name: form.name.trim(), email: form.email.trim(), message: form.message.trim() };
    const results = await Promise.allSettled([
      apiFetch("/api/messages", { method: "POST", body: payload }),
      payload.website ? Promise.reject(new Error("spam")) : sendViaWeb3Forms(payload),
    ]);

    if (results.some((result) => result.status === "fulfilled")) {
      setForm(EMPTY);
      setStatus({ state: "sent", message: "Thank you! Your message has been sent." });
    } else {
      setStatus({ state: "error", message: "Something went wrong. Please try again later or email me directly." });
    }
  };

  const contactRows = [
    profile.email && { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    profile.phone && { label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s+/g, "")}` },
    profile.location && { label: "Location", value: profile.location },
  ].filter(Boolean);

  return (
    <section id="contact" aria-labelledby="contact-title" className="section-y border-t border-line">
      <div className="container-site grid items-start gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SectionHeader section={section} index={index} id="contact-title" />
          <Reveal as="dl" delay={0.08} className="mt-10 border-t border-line">
            {contactRows.map(({ label, value, href }) => {
              const Icon = CONTACT_ICONS[label];
              return (
                <div key={label} className="flex items-center gap-4 border-b border-line py-4">
                  <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-surface-raised text-heading">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="eyebrow text-[0.6875rem]">{label}</dt>
                    <dd className="text-[1rem] font-medium text-heading">
                      {href ? (
                        <a href={href} className="link break-all">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              );
            })}
          </Reveal>
          {(socials.length > 0 || profile.resumeUrl) && (
            <Reveal as="ul" delay={0.12} className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              {profile.resumeUrl && (
                <li>
                  <a href={profile.resumeUrl} className="link text-[0.9375rem] font-medium text-heading" {...cvLinkProps(profile.resumeUrl)}>
                    <LuDownload aria-hidden="true" className="h-3.5 w-3.5" />
                    Download CV
                  </a>
                </li>
              )}
              {socials.map((link) => (
                <li key={link.id}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="link text-[0.9375rem] font-medium text-heading">
                    {link.label}
                    <LuArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </Reveal>
          )}
        </div>

        <Reveal delay={0.08} className="lg:col-span-7 lg:pl-6 xl:pl-12">
          <form onSubmit={handleSubmit} noValidate className="card relative p-6 sm:p-8 md:p-10">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="contact-name" label="Your name" error={errors.name}>
                <input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={update}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className="input"
                  placeholder="Jane Doe"
                />
              </Field>
              <Field id="contact-email" label="Your email" error={errors.email}>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={update}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className="input"
                  placeholder="jane@company.com"
                />
              </Field>
            </div>
            <div className="mt-6">
              <Field id="contact-message" label="Message" error={errors.message}>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={update}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className="input resize-y"
                  placeholder="Tell me about the role or project…"
                />
              </Field>
            </div>
            {/* Honeypot: hidden from people, tempting for bots */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update} />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button type="submit" variant="primary" leadingIcon={NodesIcon} disabled={status.state === "sending"}>
                {status.state === "sending" ? "Sending…" : section.ctaLabel || "Send message"}
              </Button>
              <div role="status" aria-live="polite">
                <AnimatePresence mode="wait">
                  {status.message && (
                    <motion.p
                      key={status.state}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`text-[0.9375rem] ${status.state === "error" ? "text-danger" : "text-heading"}`}
                    >
                      {status.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
};

export default Contact;
