import type { Experience, Project } from "@/lib/content";
import GlassCard from "./GlassCard";
import PinGallery from "./PinGallery";
import Reveal from "./Reveal";

type Props = {
  id: string;
  number: string;
  title: string;
  items: (Experience | Project)[];
};

/**
 * Shared section shell for Experience and Projects — identical reveal and
 * layout treatment. Desktop pins and scrolls the cards sideways; mobile and
 * reduced-motion get a vertical stack (see PinGallery).
 */
export default function WorkGallery({ id, number, title, items }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="py-20 md:py-0">
      <PinGallery
        heading={
          <>
            <p className="mb-4 text-[0.65rem] uppercase tracking-[0.35em] text-accent/80">
              {number} — {title}
            </p>
            <h2
              id={`${id}-heading`}
              className="chromatic font-display text-[clamp(2.6rem,9vw,8rem)] font-bold uppercase leading-none tracking-tight text-white"
            >
              <Reveal>{title}</Reveal>
            </h2>
          </>
        }
      >
        {items.map((item, i) => (
          <li
            key={item.slug}
            className="flex md:motion-safe:w-[min(37rem,75vw)] md:motion-safe:shrink-0"
          >
            <GlassCard item={item} index={i} />
          </li>
        ))}
      </PinGallery>
    </section>
  );
}
