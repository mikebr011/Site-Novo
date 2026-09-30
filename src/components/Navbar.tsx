import React, { useState } from 'react';
import { ScreenType } from '../types';
import { APP_CONFIG } from '../data/mockData';
import { Heart, Menu, X, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenType;
  isAdminLoggedIn: boolean;
  onNavigate: (screen: ScreenType) => void;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  isAdminLoggedIn,
  onNavigate,
  onOpenAdminLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; screen: ScreenType }[] = [
    { label: 'Início', screen: 'inicio' },
    { label: 'Sobre Nós', screen: 'projeto' },
    { label: 'Contato & Doações', screen: 'doador' },
  ];

  const handleNavClick = (screen: ScreenType) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="w-full top-0 sticky z-50 bg-white shadow-xs transition-all duration-300">
      <div className="flex justify-between items-center h-20 px-4 md:px-8 max-w-[1240px] mx-auto">
        {/* Logo and Brand */}
        <button
          onClick={() => handleNavClick('inicio')}
          className="flex items-center gap-3 group text-left cursor-pointer transition-transform hover:scale-[1.02]"
          aria-label="Ir para a página inicial Meu Pequeno Grande Amigo"
        >
          <img
            alt="Logo Meu Pequeno Grande Amigo"
            className="h-12 sm:h-14 w-auto object-contain"
            src={APP_CONFIG.logoUrl}
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => handleNavClick(item.screen)}
                className={`font-extrabold text-sm tracking-wide uppercase transition-all relative py-1 cursor-pointer ${
                  isActive
                    ? 'text-[#0854A7] font-black after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[3px] after:bg-[#FF2D78] after:rounded-full'
                    : 'text-[#111827] hover:text-[#FF2D78] hover:scale-105'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Admin link when logged in */}
          {isAdminLoggedIn && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`font-black text-sm tracking-wide uppercase transition-all relative py-1 flex items-center gap-1.5 cursor-pointer ${
                currentScreen === 'admin'
                  ? 'text-[#0854A7] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[3px] after:bg-[#FFC300] after:rounded-full'
                  : 'text-[#0854A7] hover:text-[#FF2D78]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#FFC300]" />
              <span>Painel Admin</span>
            </button>
          )}
        </nav>

        {/* CTA & Admin Button & Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Admin Login / Panel Button */}
          {isAdminLoggedIn ? (
            <button
              onClick={() => handleNavClick('admin')}
              className="hidden lg:inline-flex items-center gap-1.5 bg-[#0854A7] hover:bg-[#064283] text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer uppercase tracking-wider"
              title="Acessar Painel do Administrador"
            >
              <ShieldCheck className="w-4 h-4 text-[#FFC300]" />
              <span>Admin Ativo</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#0854A7] px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-[#0854A7] transition-all cursor-pointer"
              title="Acesso Administrativo"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#0854A7]" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Main CTA Button: Rosa Choque #FF2D78 */}
          <button
            onClick={() => handleNavClick('doador')}
            className="hidden sm:inline-flex items-center gap-2 bg-[#FF2D78] hover:bg-[#e02069] active:scale-95 text-white font-extrabold text-sm tracking-wider uppercase px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-white text-white" />
            <span>Quero Ajudar</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#0854A7] hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Subtle colorful separator bar */}
      <div className="brand-divider" />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-5 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => handleNavClick(item.screen)}
                  className={`text-left px-4 py-3 rounded-xl font-bold text-base transition-colors cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-[#FFF3EB] text-[#0854A7] font-black'
                      : 'text-[#111827] hover:bg-gray-50 hover:text-[#FF2D78]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <Sparkles className="w-4 h-4 text-[#FF2D78]" />}
                </button>
              );
            })}

            {/* Mobile Admin Link */}
            {isAdminLoggedIn ? (
              <button
                onClick={() => handleNavClick('admin')}
                className="text-left px-4 py-3 rounded-xl font-black text-base bg-[#0854A7] text-white flex items-center justify-between shadow-xs mt-1"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#FFC300]" />
                  <span>Painel do Administrador</span>
                </div>
                <span className="text-xs bg-[#FFC300] text-black px-2 py-0.5 rounded-full font-black">
                  ONLINE
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="text-left px-4 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:text-[#0854A7] flex items-center gap-2 mt-1"
              >
                <KeyRound className="w-4 h-4 text-[#0854A7]" />
                <span>Área do Administrador (Login)</span>
              </button>
            )}

            <div className="pt-3 border-t border-gray-100 mt-2 flex flex-col gap-2">
              <button
                onClick={() => handleNavClick('doador')}
                className="w-full bg-[#FF2D78] hover:bg-[#e02069] text-white font-black py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer uppercase tracking-wider text-sm"
              >
                <Heart className="w-5 h-5 fill-white text-white" />
                <span>Quero Ajudar (Seja Doador)</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
