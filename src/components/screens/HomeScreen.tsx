import React from 'react';
import { ScreenType } from '../../types';
import { HeroCarousel } from '../HeroCarousel';
import {
  Gift,
  Users,
  HeartHandshake,
  Heart,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
}) => {
  const totalGoal = 2000;
  const currentCount = 0;
  const percentage = Math.min(100, Math.round((currentCount / totalGoal) * 100));

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Hero Section (matching the mockup layout) */}
      <section className="pt-8 md:pt-14 pb-16 px-4 md:px-8 bg-white relative overflow-hidden">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-center">
          
          {/* Left Column: Brand Heart & Hands Illustration */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center p-2">
              <img
                src="/hero-heart.svg"
                alt="Meu Pequeno Grande Amigo - Coração e Mãos dadas"
                className="w-full h-full object-contain animate-float-slow drop-shadow-md"
              />
            </div>
          </div>

          {/* Right Column: Title, Slogan & Action Buttons */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
            <h1 className="font-['Nunito'] text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black text-[#0854A7] leading-[1.1] tracking-tight">
              MEU PEQUENO GRANDE AMIGO
            </h1>

            <div className="inline-block bg-[#FFF3EB] border-2 border-[#FFC300] px-4 py-1.5 rounded-full">
              <span className="font-['Nunito'] text-base md:text-xl font-black text-[#111827] tracking-wide">
                FAZER O BEM SEM OLHAR A QUEM!
              </span>
            </div>

            <p className="text-base md:text-lg text-[#2b2b2b] leading-relaxed max-w-xl">
              Uma bela iniciativa formada por um grupo de amigos unidos por um propósito nobre: entregar doces para crianças carentes no dia 12 de outubro. Anualmente, realizamos a arrecadação das guloseimas por conta própria e nos reunimos para fazer a distribuição diretamente nas ruas, levando carinho, alegria e kits deliciosos a quem mais precisa.
            </p>

            {/* Buttons Group (matching the mockup buttons) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Main Button: Amarelo Dourado #FFC300 */}
              <button
                onClick={() => {
                  onNavigate('projeto');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#FFC300] hover:bg-[#e6b000] active:scale-95 text-black font-black text-base px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                SAIBA MAIS
              </button>

              {/* Action Button: Rosa Choque #FF2D78 */}
              <button
                onClick={() => {
                  onNavigate('doador');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#FF2D78] hover:bg-[#e02069] active:scale-95 text-white font-extrabold text-base px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-5 h-5 fill-white text-white" />
                <span>QUERO AJUDAR</span>
              </button>
            </div>

            {/* Quick date banner */}
            <div className="flex items-center gap-2 pt-2 text-xs font-bold text-[#0854A7]">
              <Calendar className="w-4 h-4 text-[#FF2D78]" />
              <span>Distribuição de Doces e Kits no Dia das Crianças • 12 de Outubro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Colorful Section Divider */}
      <div className="brand-divider" />

      {/* 2. Seção "Nossas Frentes de Ação" */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-white relative">
        <div className="max-w-[1200px] mx-auto">
          {/* Header with playful confetti decorations */}
          <div className="text-center max-w-2xl mx-auto mb-12 relative">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1EA8F5]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D78]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFC300]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#6CC24A]" />
            </div>

            <h2 className="font-['Nunito'] text-3xl sm:text-4xl font-black text-[#0854A7] tracking-tight">
              Frentes de Ação Solidária
            </h2>
            <p className="text-base text-[#2b2b2b] mt-2 font-medium">
              Conheça as três etapas essenciais do nosso projeto: Arrecadação de Doces, Distribuição Direta nas Ruas e Preparo dos Kits Especiais.
            </p>
          </div>

          {/* 3 Playful Cards matching the mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Arrecadação */}
            <div className="bg-white border-2 border-[#1EA8F5]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
              {/* Card Header Pill */}
              <div className="bg-[#1EA8F5] py-2.5 px-4 text-center text-white font-['Nunito'] font-black text-sm sm:text-base uppercase tracking-wider">
                Arrecadação de Doces & Guloseimas
              </div>
              <div className="p-7 flex flex-col items-center text-center flex-grow">
                <div className="w-20 h-20 rounded-2xl bg-[#1EA8F5]/10 flex items-center justify-center text-[#1EA8F5] mb-5 border border-[#1EA8F5]/30">
                  <Gift className="w-10 h-10" />
                </div>
                <h3 className="font-['Nunito'] font-extrabold text-xl text-[#0854A7] mb-2">
                  Arrecadação de Guloseimas & Doces
                </h3>
                <p className="text-sm text-[#2b2b2b] leading-relaxed">
                  Anualmente, esses voluntários realizam a arrecadação das guloseimas por conta própria e contam com o apoio de doadores que confiam na causa, garantindo muitos doces para celebrar a data.
                </p>
              </div>
            </div>

            {/* Card 2: Distribuição */}
            <div className="bg-white border-2 border-[#6CC24A]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
              {/* Card Header Pill */}
              <div className="bg-[#6CC24A] py-2.5 px-4 text-center text-white font-['Nunito'] font-black text-sm sm:text-base uppercase tracking-wider">
                Distribuição Direta nas Ruas
              </div>
              <div className="p-7 flex flex-col items-center text-center flex-grow">
                <div className="w-20 h-20 rounded-2xl bg-[#6CC24A]/10 flex items-center justify-center text-[#6CC24A] mb-5 border border-[#6CC24A]/30">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="font-['Nunito'] font-extrabold text-xl text-[#0854A7] mb-2">
                  Distribuição Direta nas Ruas de Osasco
                </h3>
                <p className="text-sm text-[#2b2b2b] leading-relaxed">
                  Os voluntários se reúnem no dia 12 de outubro para fazer a distribuição diretamente nas ruas de bairros como Jardim Aliança e Rochdale em Osasco, com total responsabilidade e proteção.
                </p>
              </div>
            </div>

            {/* Card 3: Preparo dos Kits */}
            <div className="bg-white border-2 border-[#7B2CBF]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
              {/* Card Header Pill */}
              <div className="bg-[#7B2CBF] py-2.5 px-4 text-center text-white font-['Nunito'] font-black text-sm sm:text-base uppercase tracking-wider">
                Preparo dos Kits & Lanches Especiais
              </div>
              <div className="p-7 flex flex-col items-center text-center flex-grow">
                <div className="w-20 h-20 rounded-2xl bg-[#7B2CBF]/10 flex items-center justify-center text-[#7B2CBF] mb-5 border border-[#7B2CBF]/30">
                  <HeartHandshake className="w-10 h-10" />
                </div>
                <h3 className="font-['Nunito'] font-extrabold text-xl text-[#0854A7] mb-2">
                  Kits Bem Recheados com Amor
                </h3>
                <p className="text-sm text-[#2b2b2b] leading-relaxed">
                  Os kits entregues às crianças são preparados com muito carinho, contendo itens deliciosos como bolo, lanche, refrigerante e, claro, bastantes doces para celebrar essa data tão especial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Carrossel de Fotos da Campanha */}
      <section className="py-12 px-4 md:px-8 bg-[#FFF9F5] border-y border-[#FDD4B8]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FF2D78]">
                Galeria de Momentos
              </span>
              <h3 className="font-['Nunito'] text-2xl md:text-3xl font-black text-[#0854A7] mt-1">
                Alegria e Solidariedade em Ação
              </h3>
            </div>
            <div className="flex flex-col md:items-end gap-2">
              <p className="text-sm text-[#2b2b2b] max-w-md">
                Veja registros das nossas ações, preparação dos kits deliciosos e a emoção das entregas no Dia das Crianças.
              </p>
              <button
                onClick={() => {
                  onNavigate('projeto');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-black text-[#0854A7] hover:text-[#FF2D78] flex items-center gap-1 transition-colors underline cursor-pointer"
              >
                Ver todos os registros detalhados na Galeria Completa →
              </button>
            </div>
          </div>

          <HeroCarousel />
        </div>
      </section>

      {/* 4. AÇÃO COMUNITÁRIA NAS RUAS (DESTAQUE DA INICIATIVA) */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          {/* Header da Ação */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-[#1EA8F5]/10 border border-[#1EA8F5]/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#0854A7] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#1EA8F5]" />
              <span>Ação Comunitária Direta</span>
            </div>
            <h2 className="font-['Nunito'] text-2xl sm:text-3xl md:text-4xl font-black text-[#0854A7]">
              Distribuição Direta nas Ruas com Carinho e Respeito
            </h2>
            <p className="text-sm md:text-base text-[#2b2b2b] mt-2">
              Momentos marcantes com entregas responsáveis para as crianças de Osasco, especialmente nos bairros Jardim Aliança e Rochdale.
            </p>
          </div>

          {/* 4 Cards de Destaque da Ação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Destaque 1 */}
            <div className="bg-white border-2 border-gray-100 hover:border-[#1EA8F5] p-6 rounded-2xl shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1EA8F5]/10 text-[#1EA8F5] flex items-center justify-center font-bold mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="font-['Nunito'] font-black text-lg text-[#0854A7] mb-1">
                  Presença nos Bairros
                </h4>
                <p className="text-xs text-[#2b2b2b] leading-relaxed">
                  Atuação marcante em Osasco, nos bairros Jardim Aliança e Rochdale, levando a alegria diretamente onde as famílias moram.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] font-bold text-[#0854A7]">
                Jardim Aliança & Rochdale
              </div>
            </div>

            {/* Destaque 2 */}
            <div className="bg-white border-2 border-gray-100 hover:border-[#FF2D78] p-6 rounded-2xl shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FF2D78]/10 text-[#FF2D78] flex items-center justify-center font-bold mb-4">
                  <Gift className="w-6 h-6" />
                </div>
                <h4 className="font-['Nunito'] font-black text-lg text-[#0854A7] mb-1">
                  Kits Recheados
                </h4>
                <p className="text-xs text-[#2b2b2b] leading-relaxed">
                  Kits muito bem preparados com itens deliciosos: bolo fresquinho, lanche saboroso, refrigerante e bastantes guloseimas.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] font-bold text-[#FF2D78]">
                Bolo, lanche, refri & doces
              </div>
            </div>

            {/* Destaque 3 */}
            <div className="bg-white border-2 border-gray-100 hover:border-[#6CC24A] p-6 rounded-2xl shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#6CC24A]/10 text-[#6CC24A] flex items-center justify-center font-bold mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-['Nunito'] font-black text-lg text-[#0854A7] mb-1">
                  Proteção & Cuidado
                </h4>
                <p className="text-xs text-[#2b2b2b] leading-relaxed">
                  A organização atua de forma responsável para que pais e filhos tenham a garantia de protocolos adequados de segurança.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] font-bold text-[#6CC24A]">
                Cuidado com a comunidade
              </div>
            </div>

            {/* Destaque 4 */}
            <div className="bg-white border-2 border-gray-100 hover:border-[#FFC300] p-6 rounded-2xl shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFC300]/20 text-[#111827] flex items-center justify-center font-bold mb-4">
                  <Heart className="w-6 h-6 fill-[#FF2D78] text-[#FF2D78]" />
                </div>
                <h4 className="font-['Nunito'] font-black text-lg text-[#0854A7] mb-1">
                  Gratidão de Coração
                </h4>
                <p className="text-xs text-[#2b2b2b] leading-relaxed">
                  Agradecimento especial a Deus, aos doadores que confiaram na causa, aos voluntários e às crianças, que são a alma do projeto.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] font-bold text-[#0854A7]">
                A alma do projeto
              </div>
            </div>
          </div>

          {/* Banner de Chamada para Ação */}
          <div className="bg-[#FFF3EB] border-2 border-[#FFC300] rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="font-['Nunito'] font-black text-xl md:text-2xl text-[#0854A7]">
                Nossa entrega é feita diretamente nas ruas, levando aconchego até as crianças!
              </h3>
              <p className="text-sm text-[#2b2b2b] mt-1 max-w-xl">
                Junte-se ao nosso grupo de amigos voluntários. Sua doação se transforma em kits saborosos para o dia 12 de outubro.
              </p>
            </div>
            <button
              onClick={() => {
                onNavigate('doador');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-[#FF2D78] hover:bg-[#e02069] active:scale-95 text-white font-black text-sm px-6 py-3 rounded-xl uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white text-white" />
              <span>Quero Ajudar</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Progress Tracker Section (Meta da Campanha) */}
      <section className="bg-white py-10 px-4 md:px-8 border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto bg-white border-2 border-[#1EA8F5]/30 rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Top Notice: Em Manutenção */}
          <div className="mb-6 bg-[#FFF9F5] border-2 border-[#FFC300] rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-[#FFC300] text-black rounded-lg shrink-0 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-black" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['Nunito'] font-black text-sm uppercase tracking-wider text-[#0854A7]">
                    Em Manutenção
                  </span>
                  <span className="bg-[#FF2D78] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                    Atualização Oficial
                  </span>
                </div>
                <p className="text-xs text-[#2b2b2b] font-medium mt-0.5">
                  O painel de apuração de doações está em manutenção para inicialização e validação das contagens deste ano.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-black text-[#0854A7] bg-white px-3 py-1.5 rounded-lg border border-[#0854A7]/20 shadow-2xs">
                Contador Zerado: 0 Kits
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#FFC300] text-black rounded-xl shadow-xs">
                  <Gift className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-xl md:text-2xl text-[#0854A7] font-['Nunito']">
                  Meta da Campanha: 2.000 Kits de Doces & Lanches
                </h3>
              </div>
              <p className="text-sm text-[#2b2b2b] mt-1">
                Acompanhe a arrecadação de guloseimas e apoio para a distribuição do Dia das Crianças
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="font-black text-3xl text-[#0854A7] font-['Nunito']">
                {currentCount.toLocaleString('pt-BR')}
              </span>
              <span className="text-sm font-bold text-[#2b2b2b]"> / {totalGoal.toLocaleString('pt-BR')} kits</span>
            </div>
          </div>

          {/* Progress Bar with colorful gradient */}
          <div className="w-full bg-gray-100 h-5 rounded-full overflow-hidden p-0.5 border border-gray-200">
            <div
              className="bg-gradient-to-r from-[#1EA8F5] via-[#FF2D78] to-[#FFC300] h-full rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-bold text-[#2b2b2b] mt-2 gap-1">
            <span className="text-[#0854A7] font-extrabold">{percentage}% da meta alcançada (0 kits registrados)</span>
            <span>Meta de 2.000 kits para a distribuição do Dia das Crianças no dia 12 de outubro.</span>
          </div>
        </div>
      </section>

      {/* 6. Bottom Quick CTA Banner */}
      <section className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-[1000px] mx-auto bg-gradient-to-r from-[#0854A7] to-[#0b6ad0] text-white rounded-3xl p-8 md:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#FFC300]">
              Faça parte desta corrente do bem
            </span>
            <h3 className="font-['Nunito'] text-2xl md:text-3xl font-black text-white mt-1">
              Quer ser um doador da nossa campanha?
            </h3>
            <p className="text-sm text-white/90 max-w-lg mt-1">
              Faça uma doação via PIX ou cadastre seu número para nossa equipe entrar em contato.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => {
                onNavigate('doador');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-[#FF2D78] hover:bg-[#e02069] active:scale-95 text-white font-black text-sm px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Quero Ajudar</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
