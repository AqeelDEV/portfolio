import { isTodo, todoHint } from "@/lib/content";

/**
 * Visible placeholder for unfilled {{FILL: ...}} content — deliberately
 * designed (dashed amber, mono) so it reads as "pending", never as broken.
 */
export function Todo({ value }: { value: string }) {
  return (
    <span
      role="note"
      className="inline-flex max-w-full items-baseline gap-2 rounded-md border border-dashed border-amber-400/60 bg-amber-400/5 px-2.5 py-1 font-mono text-[0.8em] leading-snug text-amber-300"
    >
      <span className="font-bold tracking-wider">TODO</span>
      <span className="truncate text-amber-200/80">{todoHint(value)}</span>
    </span>
  );
}

/** Renders real content, or the Todo treatment when it's still a {{FILL}}. */
export function Text({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return isTodo(value) ? (
    <Todo value={value} />
  ) : (
    <span className={className}>{value}</span>
  );
}
