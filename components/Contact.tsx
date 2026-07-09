import { site, isTodo } from "@/lib/content";
import { Todo } from "./Todo";
import Magnetic from "./Magnetic";

function SocialLink({ label, url }: { label: string; url: string }) {
  if (isTodo(url)) return <Todo value={url} />;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="glass rounded-full px-7 py-3.5 text-sm font-medium text-white/85 transition-colors hover:border-accent/50 hover:text-white"
    >
      {label} ↗
    </a>
  );
}

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="pt-24 md:pt-36">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-accent/80">
          08 · Contact
        </p>
        <h2
          id="contact-heading"
          className="chromatic mt-4 font-display text-[clamp(2.6rem,9vw,8rem)] font-bold uppercase leading-none tracking-tight text-white"
        >
          Let&apos;s build
        </h2>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/75">
          {site.availability}
        </p>

        <a
          // encode so a future content edit containing ?/&/%0A can't inject
          // extra mailto headers (cc/bcc/body)
          href={`mailto:${encodeURIComponent(site.email)}`}
          className="mt-10 inline-block font-display text-[clamp(1.3rem,3.5vw,2.6rem)] font-bold text-white underline decoration-accent/50 decoration-2 underline-offset-8 transition-colors hover:decoration-accent"
        >
          {site.email}
        </a>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Magnetic>
            <a
              href={site.cvUrl}
              download
              className="inline-block rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-ink transition hover:brightness-110"
            >
              Download CV
            </a>
          </Magnetic>
          <SocialLink label="LinkedIn" url={site.linkedinUrl} />
          <SocialLink label="GitHub" url={site.githubUrl} />
        </div>
      </div>

      <footer className="mt-24 border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 text-xs text-white/55">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <span>Designed &amp; built by {site.name}</span>
        </div>
      </footer>
    </section>
  );
}
