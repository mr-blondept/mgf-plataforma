import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  label?: string;
  className?: string;
  sizeClassName?: string;
  centered?: boolean;
};

export default function LoadingSpinner({
  label = "A carregar...",
  className,
  sizeClassName = "h-5 w-5",
  centered = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-sm text-muted-foreground",
        centered && "justify-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClassName)} />
      <span>{label}</span>
    </div>
  );
}
