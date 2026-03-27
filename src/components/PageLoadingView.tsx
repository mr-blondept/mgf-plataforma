import { cn } from "@/lib/utils";
import LoadingSkeleton from "@/components/LoadingSkeleton";

type PageLoadingViewProps = {
  label?: string;
  detail?: string;
  className?: string;
  compact?: boolean;
};

export default function PageLoadingView({
  label = "A carregar",
  detail = "A preparar o conteúdo para mostrar tudo de uma vez.",
  className,
  compact = false,
}: PageLoadingViewProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.02))]" />
      <div className="absolute inset-0 soft-grain opacity-20" />

      <div
        className={cn(
          "relative flex flex-col items-center text-center",
          compact ? "gap-4" : "gap-6",
        )}
      >
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/8 blur-md" />
          <div className="absolute inset-0 rounded-full border border-primary/15" />
          <div className="absolute inset-[6px] rounded-full border-[5px] border-transparent border-t-primary border-r-cyan-400/70 animate-spin" />
          <div className="absolute inset-[16px] rounded-full border border-primary/10 bg-background/80 backdrop-blur-sm" />
          <div className="absolute inset-[27px] rounded-full bg-gradient-to-br from-primary/18 via-cyan-400/10 to-transparent" />
          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_20px_rgba(14,165,233,0.45)]" />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-muted-foreground">
            {label}
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">
            A preparar a tua vista
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{detail}</p>
        </div>

        <div
          className={cn(
            "w-full rounded-[1.75rem] border border-border/60 bg-background/45 p-4 shadow-sm",
            compact ? "max-w-md" : "",
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <LoadingSkeleton className="h-3 w-28 rounded-full" />
            <LoadingSkeleton className="h-8 w-20 rounded-full" />
          </div>

          <div
            className={cn(
              "grid gap-3",
              compact ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3",
            )}
          >
            <LoadingSkeleton className="h-28 rounded-[1.5rem]" />
            <LoadingSkeleton className="h-28 rounded-[1.5rem]" />
            {!compact ? <LoadingSkeleton className="h-28 rounded-[1.5rem]" /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
