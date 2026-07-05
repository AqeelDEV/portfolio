"use client";

import { Link } from "next-view-transitions";
import type { Experience, Project } from "@/lib/content";
import { ACCENT_RGB } from "@/lib/palette";
import { Text } from "./Todo";

export default function GlassCard({
  item,
  index,
}: {
  item: Experience | Project;
  index: number;
}) {
  const org = "org" in item && item.org ? item.org : undefined;

  return (
    <Link
      href={`/work/${item.slug}`}
      data-cursor="view"
      style={{ viewTransitionName: `work-${item.slug}` }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className="glass group relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl p-7 transition-transform duration-300 ease-out hover:-translate-y-1.5 md:p-9"
    >
      {/* cursor-tracking glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(${ACCENT_RGB}, 0.11), transparent 70%)`,
        }}
      />
      {/* top edge highlight — sells the glass */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />

      <div className="flex items-baseline justify-between gap-4 text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
        <span className="flex items-baseline gap-3">
          <span aria-hidden className="font-display text-accent/80">
            {String(index + 1).padStart(2, "0")}
          </span>
          {org ? <Text value={org} /> : "Project"}
        </span>
        <span>
          <Text value={item.dates} />
        </span>
      </div>

      <h3 className="font-display text-2xl font-bold leading-tight text-white md:text-3xl">
        <Text value={item.role} />
      </h3>

      <p className="text-sm leading-relaxed text-white/70 md:text-base">
        <Text value={item.summary} />
      </p>

      <ul className="flex flex-col gap-2">
        {item.impact.map((line, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-white/65">
            <span aria-hidden className="text-accent">
              →
            </span>
            <Text value={line} />
          </li>
        ))}
      </ul>

      <ul className="mt-auto flex flex-wrap gap-2 pt-2">
        {item.stack.map((chip, i) => (
          <li
            key={i}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60"
          >
            <Text value={chip} />
          </li>
        ))}
      </ul>

      <span
        aria-hidden
        className="absolute bottom-7 right-7 text-[0.65rem] uppercase tracking-[0.25em] text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        View ↗
      </span>
    </Link>
  );
}
