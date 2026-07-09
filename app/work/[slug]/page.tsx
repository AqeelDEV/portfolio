import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { allWork, getWorkBySlug, isTodo, site } from "@/lib/content";
import { Text, Todo } from "@/components/Todo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allWork.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) return {};
  const title = isTodo(work.role)
    ? `Work · ${site.name}`
    : `${work.role} · ${site.name}`;
  return {
    title,
    description: isTodo(work.summary) ? undefined : work.summary,
  };
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <h2 className="font-display text-xs font-bold uppercase tracking-[0.35em] text-accent">
        {title}
      </h2>
      <div className="mt-4 text-base leading-relaxed text-white/80">
        {children}
      </div>
    </section>
  );
}

function ExternalLink({ label, url }: { label: string; url: string }) {
  // Real {{FILL}} token → keep the pending badge (defensive; unused today).
  if (isTodo(url)) return <Todo value={url} />;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="glass rounded-full px-6 py-3 text-sm font-medium text-white/85 transition-colors hover:border-accent/50 hover:text-white"
    >
      {label} ↗
    </a>
  );
}

export default async function WorkDetailPage({ params }: Params) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) notFound();

  const org = "org" in work && work.org ? work.org : undefined;

  // Only surface links that actually exist. An absent optional URL is omitted
  // entirely (no pending badge); a real {{FILL}} token still renders as pending.
  const links = [
    { label: "Live", url: work.liveUrl },
    { label: "Repo", url: work.repoUrl },
  ].filter((l): l is { label: string; url: string } => !!l.url);

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 pb-32 pt-28 md:pt-36">
      <Link
        href="/#work"
        className="text-[0.7rem] uppercase tracking-[0.3em] text-white/60 transition-colors hover:text-white"
      >
        ← All work
      </Link>

      <header
        className="glass mt-8 rounded-3xl p-8 md:p-12"
        style={{ viewTransitionName: `work-${work.slug}` }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3 text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
          <span>{org ? <Text value={org} /> : "Project"}</span>
          <span>
            <Text value={work.dates} />
          </span>
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold uppercase leading-tight tracking-tight text-white md:text-5xl">
          <Text value={work.role} />
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-white/75">
          <Text value={work.summary} />
        </p>
      </header>

      <DetailSection title="Problem">
        <p>
          <Text value={work.problem} />
        </p>
      </DetailSection>

      <DetailSection title="What I built">
        <p>
          <Text value={work.build} />
        </p>
      </DetailSection>

      <DetailSection title="My role">
        <p>
          <Text value={work.myRole} />
        </p>
      </DetailSection>

      <DetailSection title="Stack">
        <ul className="flex flex-wrap gap-2">
          {work.stack.map((chip, i) => (
            <li
              key={i}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-white/70"
            >
              <Text value={chip} />
            </li>
          ))}
        </ul>
      </DetailSection>

      <DetailSection title="Impact">
        <ul className="flex flex-col gap-3">
          {work.metrics.map((metric, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden className="text-accent">
                →
              </span>
              <Text value={metric} />
            </li>
          ))}
        </ul>
      </DetailSection>

      {links.length > 0 && (
        <DetailSection title="Links">
          <div className="flex flex-wrap items-center gap-4">
            {links.map((l) => (
              <ExternalLink key={l.label} label={l.label} url={l.url} />
            ))}
          </div>
        </DetailSection>
      )}
    </main>
  );
}
