import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: 100 | 200 | 300 | 400 | 500;
  threshold?: number;
}

export function FadeIn({ children, className, delay, threshold = 0.1, ...props }: FadeInProps) {
  const { ref, isVisible } = useReveal(threshold);

  return (
    <div
      ref={ref}
      className={cn(
        "reveal-hidden",
        isVisible && "reveal-visible",
        delay && `delay-${delay}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
