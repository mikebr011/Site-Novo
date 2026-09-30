import React from 'react';
import { ScreenType } from '../types';
import { APP_CONFIG } from '../data/mockData';
import { ThumbsUp, Camera, Play, MessageCircle, MapPin, Mail, Phone, Heart, Download } from 'lucide-react';

interface FooterProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdminLogin }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-16 bg-[#FDD4B8] border-t-4 border-[#0854A7] text-[#111827] transition-colors">
      {/* Upper colorful accent stripe */}
      <div className="w-full h-1.5 bg-gradient-to-r from-[#1EA8F5] via-[#FF2D78] to-[#FFC300]" />

      <div className="py-12 px-4 md:px-8 max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img
              src={APP_CONFIG.logoUrl}
              alt="Logo Meu Pequeno Grande Amigo"
              className="h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <p className="text-sm text-[#2b2b2b] leading-relaxed max-w-sm">
            <strong className="text-[#0854A7] font-extrabold">{APP_CONFIG.name}</strong> — Fazer o bem sem olhar a quem! Um grupo de amigos unidos para entregar doces e kits recheados para crianças no dia 12 de outubro.
          </p>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0854A7]">
            <Heart className="w-4 h-4 fill-[#FF2D78] text-[#FF2D78]" />
            <span>Dia das Crianças • 12 de Outubro</span>
          </div>
        </div>

        {/* Links Úteis */}
        <div className="flex flex-col gap-3">
          <h4 className="font-['Nunito'] font-black text-lg text-[#0854A7] tracking-wide border-b border-[#0854A7]/20 pb-2">
            Links Úteis
          </h4>
          <nav className="flex flex-col gap-2 font-bold text-sm text-[#111827]">
            <button
              onClick={() => {
                onNavigate('inicio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left hover:text-[#FF2D78] transition-colors cursor-pointer"
            >
              Início
            </button>
            <button
              onClick={() => {
                onNavigate('projeto');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left hover:text-[#0854A7] transition-colors cursor-pointer"
            >
              Sobre Nós (O Projeto)
            </button>
            <button
              onClick={() => {
                onNavigate('doador');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left hover:text-[#0854A7] transition-colors cursor-pointer"
            >
              Quero Ajudar (Seja Doador)
            </button>
            {onOpenAdminLogin && (
              <button
                onClick={onOpenAdminLogin}
                className="text-left text-xs font-black text-[#0854A7] hover:text-[#FF2D78] transition-colors cursor-pointer pt-1 flex items-center gap-1"
              >
                <span>🔒 Área do Administrador</span>
              </button>
            )}
          </nav>
        </div>

        {/* Contato com ícones vibrantes */}
        <div className="flex flex-col gap-3">
          <h4 className="font-['Nunito'] font-black text-lg text-[#0854A7] tracking-wide border-b border-[#0854A7]/20 pb-2">
            Contato
          </h4>
          <ul className="flex flex-col gap-3 text-sm text-[#111827] font-semibold">
            <li className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#1EA8F5] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Phone className="w-4 h-4" />
              </span>
              <a
                href={`https://wa.me/${APP_CONFIG.whatsappRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0854A7] transition-colors"
              >
                {APP_CONFIG.whatsapp}
              </a>
            </li>

            <li className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#6CC24A] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Mail className="w-4 h-4" />
              </span>
              <a
                href={`mailto:${APP_CONFIG.email}`}
                className="hover:text-[#0854A7] transition-colors break-all"
              >
                {APP_CONFIG.email}
              </a>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#FF2D78] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <MapPin className="w-4 h-4" />
              </span>
              <span className="text-xs pt-1">{APP_CONFIG.location}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Social Media Circular Badges (Facebook, Instagram, YouTube, WhatsApp) */}
      <div className="py-5 border-t border-[#0854A7]/15 px-4 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-3">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center transition-all transform hover:scale-110 shadow-sm"
          >
            <ThumbsUp className="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-10 h-10 rounded-full bg-[#E4405F] text-white flex items-center justify-center transition-all transform hover:scale-110 shadow-sm"
          >
            <Camera className="w-5 h-5" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center transition-all transform hover:scale-110 shadow-sm"
          >
            <Play className="w-5 h-5 fill-current" />
          </a>
          <a
            href={`https://wa.me/${APP_CONFIG.whatsappRaw}?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20o%20projeto%20Meu%20Pequeno%20Grande%20Amigo`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center transition-all transform hover:scale-110 shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full pt-4 border-t border-[#0854A7]/10 gap-3 text-xs font-bold text-[#111827]">
          <p className="uppercase tracking-wider">
            © {currentYear} {APP_CONFIG.name}. Todos os direitos reservados.
          </p>

          <a
            href="/api/download-project"
            download="projeto-meu-pequeno-grande-amigo.zip"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#0854A7] hover:text-white text-[#0854A7] border border-[#0854A7]/20 shadow-xs transition-all uppercase tracking-wider text-[11px] font-black cursor-pointer"
            title="Baixar todo o código-fonte compactado em .ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Projeto (.zip)</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
