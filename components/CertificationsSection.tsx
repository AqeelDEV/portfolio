import { certifications } from "@/lib/content";
import Reveal from "./Reveal";
import CertificationsGrid from "./CertificationsGrid";

export default function CertificationsSection() {
  return (
    <section
      id="certifications"
      aria-labelledby="certifications-heading"
      className="py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-4 text-[0.65rem] uppercase tracking-[0.35em] text-accent/80">
          06 — Certifications
        </p>
        <h2
          id="certifications-heading"
          className="chromatic font-display text-[clamp(2.6rem,9vw,8rem)] font-bold uppercase leading-none tracking-tight text-white"
        >
          <Reveal>Certifications</Reveal>
        </h2>
        <div className="mt-12 md:mt-16">
          <CertificationsGrid items={certifications} />
        </div>
      </div>
    </section>
  );
}
