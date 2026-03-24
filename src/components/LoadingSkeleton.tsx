import { cn } from "@/lib/utils";

type LoadingSkeletonProps = {
  className?: string;
};

export default function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-gradient-to-r from-secondary/90 via-secondary/55 to-secondary/90",
        className,
      )}
      aria-hidden="true"
    />
  );
}
