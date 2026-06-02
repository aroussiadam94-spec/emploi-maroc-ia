import { AlertCircle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import BrandLogo from "@/components/BrandLogo";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="app-shell flex min-h-screen flex-col" style={{ background: "#07090F" }}>
      <header className="nav-glass p-6">
        <BrandLogo onClick={handleGoHome} />
      </header>

      <div className="flex flex-1 items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-3xl p-10 text-center"
          style={{
            background: "rgba(14,16,32,0.85)",
            border: "1px solid rgba(224,122,95,0.2)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 40px rgba(224,122,95,0.05)"
          }}
        >
          <div className="mb-6 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl" style={{ background: "rgba(224,122,95,0.1)", border: "1px solid rgba(224,122,95,0.2)" }}>
              <div className="absolute inset-0 animate-ping rounded-2xl opacity-20" style={{ background: "#E07A5F" }} />
              <AlertCircle size={36} style={{ color: "#E07A5F" }} />
            </div>
          </div>

          <h1
            className="mb-2 text-6xl font-black text-[#F0EDE6]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            404
          </h1>

          <h2 className="mb-4 text-xl font-bold text-[#E07A5F]">
            Page introuvable
          </h2>

          <p className="mb-8 leading-relaxed text-[#8B7D6B]">
            Désolé, la page que vous recherchez n'existe pas.
            <br />
            Elle a peut-être été déplacée ou supprimée.
          </p>

          <button
            onClick={handleGoHome}
            className="btn-gold mx-auto flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
