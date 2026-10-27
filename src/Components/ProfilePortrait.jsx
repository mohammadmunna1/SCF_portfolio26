import { resolveAsset } from "../lib/api";
import SupplyJourney from "./illustrations/SupplyJourney";

/** "Spectrum Software & Consulting (Pvt.) Ltd." → "Spectrum Software & Consulting" */
const shortCompany = (company = "") =>
  company.replace(/\s*\((?:pvt\.?|private)\)\s*ltd\.?$|\s+(?:pvt\.?\s+)?ltd\.?$/i, "");

/** "Postgraduate Diploma (PGD) in Logistics & …" → "PGD · Logistics & …"; other names as they are. */
const compactDegree = (degree = "") => {
  const match = degree.match(/\(([A-Z]{2,6})\)\s+in\s+(.+)$/);
  return match ? `${match[1]} · ${match[2]}` : degree;
};

/** "Academy of Business Professionals (ABP)" → "ABP" */
const shortName = (name = "") => name.match(/\(([A-Z]{2,8})\)\s*$/)?.[1] || name;

/**
 * A small card pinned to the portrait — like a label on a parcel — with a status line, a title and a note.
 * Compact until wide screens (where `extra` is added to the note), so it never hides a stop of the ring.
 */
function PortraitLabel({ status, title, note, extra, accent = false, className = "" }) {
  return (
    <div
      className={`absolute w-[min(16rem,54%)] rounded-xl border border-line bg-surface-raised/95 p-2.5 shadow-lg backdrop-blur xl:p-3.5 ${className}`}
    >
      <p className="eyebrow flex items-center gap-2 text-[0.625rem] xl:text-[0.6875rem]">
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${accent ? "bg-accent" : "bg-heading/40"}`} />
        {status}
      </p>
      <p className="mt-1 text-[0.8125rem] font-semibold leading-snug text-heading xl:mt-1.5 xl:text-[0.875rem]">
        {title}
      </p>
      {note && (
        <p className="mt-0.5 text-[0.75rem] leading-snug text-body xl:text-[0.8125rem]">
          {note}
          {extra && <span className="hidden xl:inline"> · {extra}</span>}
        </p>
      )}
    </div>
  );
}

/**
 * The portrait inside the field-to-consumer ring, with the current role and the degree in progress pinned
 * to it. The bottom margin leaves room for the ring's caption.
 */
export default function ProfilePortrait({ profile, experience, education, className = "" }) {
  const current = experience.find((job) => job.current);
  const studying = education.find((item) => item.status === "ongoing");

  return (
    <div className={`relative mx-auto mb-12 aspect-[5/6] w-full max-w-[25rem] lg:max-w-[28rem] ${className}`}>
      <SupplyJourney />
      <div className="absolute inset-x-[14%] bottom-[10%] top-[6.7%] overflow-hidden rounded-[1.75rem] bg-photo">
        <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-60" />
        {profile.portrait && (
          <img
            src={resolveAsset(profile.portrait)}
            alt={profile.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-x-0 bottom-0 h-[96%] w-full object-cover object-[50%_0%]"
          />
        )}
      </div>
      {studying && (
        <PortraitLabel
          status="In progress"
          title={compactDegree(studying.degree)}
          note={shortName(studying.institution)}
          className="right-0 top-[2%] sm:-right-[4%]"
        />
      )}
      {current && (
        <PortraitLabel
          status="Now"
          accent
          title={current.role}
          note={shortCompany(current.company)}
          extra={current.tags?.[0]}
          className="bottom-[17%] left-0 sm:-left-[4%]"
        />
      )}
    </div>
  );
}
