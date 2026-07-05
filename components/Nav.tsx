import Link from "next/link";
import Magnetic from "./Magnetic";

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 md:px-8 md:py-6">
      <Link
        href="/"
        className="font-display text-sm font-bold uppercase tracking-[0.25em] text-white"
      >
        AJ<span className="text-accent">.</span>
      </Link>
      <nav
        aria-label="Primary"
        className="glass flex items-center gap-5 rounded-full px-6 py-3 text-[0.7rem] uppercase tracking-[0.25em]"
      >
        <Magnetic>
          <Link href="/#work" className="text-white/70 transition-colors hover:text-white">
            Work
          </Link>
        </Magnetic>
        <span aria-hidden className="h-px w-8 bg-white/20" />
        <Magnetic>
          <Link href="/#contact" className="text-white/70 transition-colors hover:text-white">
            Contact
          </Link>
        </Magnetic>
      </nav>
    </header>
  );
}
