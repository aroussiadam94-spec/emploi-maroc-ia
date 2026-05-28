import { BriefcaseBusiness, Sparkles } from "lucide-react";

type BrandLogoProps = {
  compact?: boolean;
  onClick?: () => void;
};

export default function BrandLogo({ compact = false, onClick }: BrandLogoProps) {
  const content = (
    <>
      <span className="brand-mark relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg shadow-blue-950/20">
        <BriefcaseBusiness className="h-5 w-5" />
        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-emerald-400 p-0.5 text-slate-950" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-base font-black tracking-tight text-foreground">Emploi Maroc</span>
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-primary">IA Matching</span>
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="group flex items-center gap-3 transition-transform duration-200 hover:-translate-y-0.5">
        {content}
      </button>
    );
  }

  return <div className="flex items-center gap-3">{content}</div>;
}
