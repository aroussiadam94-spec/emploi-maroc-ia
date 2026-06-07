// Props accepted by the BrandLogo component.
// - compact: when true, hides the text portion and only shows the icon mark.
// - onClick: if provided, the logo becomes a clickable button (e.g. for navigation).
type BrandLogoProps = {
  compact?: boolean;
  onClick?: () => void;
};

export default function BrandLogo({ compact = false, onClick }: BrandLogoProps) {
  // Build the visual content once so it can be reused in both the
  // button and the plain div variants below.
  const content = (
    <>
      {/* Gold geometric logo mark – a square badge containing a Moroccan star */}
      <span
        className="brand-mark relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#fafafa] shadow-lg"
        style={{ boxShadow: "0 4px 20px rgba(5,150,105,0.35)" }}
      >
        {/* Moroccan 6-point star SVG icon used as the brand symbol */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L13.8 8.2L20 7L15.8 11.8L18 18L12 14.5L6 18L8.2 11.8L4 7L10.2 8.2L12 2Z"
            fill="#fafafa"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* Text portion – hidden when `compact` is true (e.g. mobile sidebar collapsed state) */}
      {!compact && (
        <span className="leading-tight">
          {/* Primary brand name displayed in a serif font for a premium feel */}
          <span
            className="block text-base tracking-tight text-[#1c1917]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800 }}
          >
            Emploi Maroc
          </span>
          {/* Tagline displayed in small gold uppercase letters beneath the brand name */}
          <span className="block text-[10px] font-bold uppercase tracking-[0.20em] text-[#059669]">
            IA · Carrières
          </span>
        </span>
      )}
    </>
  );

  // When an onClick handler is provided, wrap the logo in a <button> so it is
  // keyboard-accessible and screen-reader-friendly.
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

  // Default: render as a non-interactive flex container (e.g. in a header or footer).
  return <div className="flex items-center gap-3">{content}</div>;
}
