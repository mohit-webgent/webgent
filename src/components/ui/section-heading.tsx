import { TextReveal } from "@/components/animations/text-reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", className = "" }: SectionHeadingProps) {
  return (
    <div className={`${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <TextReveal className="display-lg">{title}</TextReveal>
      {description && <p className="lede mt-3 max-w-xl">{description}</p>}
    </div>
  );
}
