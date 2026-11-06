import { TextReveal } from "@/components/animations/text-reveal";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/** The opening block of an inner page. */
export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <header className="relative isolate overflow-hidden pb-8 pt-10 sm:pb-10 sm:pt-14">
      <div className="wrap">
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow fade-up mb-4">{eyebrow}</p>}
          <TextReveal as="h1" immediate className="display-xl">
            {title}
          </TextReveal>
          {description && (
            <p className="lede fade-up mt-4 max-w-2xl" style={{ "--i": 2 } as React.CSSProperties}>
              {description}
            </p>
          )}
          {children && (
            <div className="fade-up mt-6" style={{ "--i": 3 } as React.CSSProperties}>
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
