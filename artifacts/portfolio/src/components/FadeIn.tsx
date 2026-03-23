import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  threshold?: number;
}

export function FadeIn({ children, className, delay, threshold = 0.1, style, ...props }: FadeInProps) {
  const { ref, isVisible } = useReveal(threshold);

  return (
    <div
      ref={ref}
      className={cn("reveal-hidden", isVisible && "reveal-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms`, ...style } : style}
      {...props}
    >
      {children}
    </div>
  );
}
