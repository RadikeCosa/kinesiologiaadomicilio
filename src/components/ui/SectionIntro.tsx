import {
  SECTION_LEAD_CLASS,
  SECTION_TITLE_CLASS,
} from "@/components/ui/styleTokens";

interface SectionIntroProps {
  title: string;
  description: string;
  titleAs?: "h1" | "h2";
}

export function SectionIntro({
  title,
  description,
  titleAs = "h2",
}: SectionIntroProps) {
  const HeadingTag = titleAs;

  return (
    <div className="text-center">
      <HeadingTag className={SECTION_TITLE_CLASS}>{title}</HeadingTag>
      <p className={SECTION_LEAD_CLASS}>{description}</p>
    </div>
  );
}
