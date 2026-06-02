type BrandLogoProps = {
  compact?: boolean;
  onClick?: () => void;
};

export default function BrandLogo({ compact = false, onClick }: BrandLogoProps) {
  const content = (
    <>
      {/* Gold geometric logo mark */}
      <span
        className="brand-mark relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#07090F] shadow-lg"
        style={{ boxShadow: "0 4px 20px rgba(201,168,76,0.35)" }}
      >
        {/* Moroccan star SVG */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L13.8 8.2L20 7L15.8 11.8L18 18L12 14.5L6 18L8.2 11.8L4 7L10.2 8.2L12 2Z"
            fill="#07090F"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {!compact && (
        <span className="leading-tight">
          <span
            className="block text-base tracking-tight text-[#F0EDE6]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800 }}
          >
            Emploi Maroc
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.20em] text-[#C9A84C]">
            IA · Carrières
          </span>
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="group flex items-center gap-3 transition-all duration-200 hover:opacity-90"
        aria-label="Emploi Maroc — Accueil"
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-center gap-3">{content}</div>;
}
