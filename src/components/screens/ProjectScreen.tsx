import React, { useState } from 'react';
import { ScreenType, GalleryPhoto } from '../../types';
import { APP_CONFIG, GALLERY_PHOTOS } from '../../data/mockData';
import {
  Heart,
  Calendar,
  Sparkles,
  Award,
  Users,
  Gift,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  X,
  BookOpen,
  Smile,
} from 'lucide-react';

interface ProjectScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const ProjectScreen: React.FC<ProjectScreenProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const filteredPhotos =
    activeCategory === 'todos'
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.category === activeCategory);

  const workflowSteps = [
    {
      step: '01',
      title: 'Arrecadação de Guloseimas',
      desc: 'Anualmente, os voluntários realizam a arrecadação de doces e recursos por conta própria e com o apoio de doadores que confiam na causa.',
      icon: Gift,
      color: '#1EA8F5',
    },
    {
      step: '02',
      title: 'Preparo dos Kits Recheados',
      desc: 'Montagem dedicada dos kits preparados com muito carinho, contendo bolo, lanche, refrigerante e bastantes doces deliciosos.',
      icon: CheckCircle2,
      color: '#6CC24A',
    },
    {
      step: '03',
      title: 'Responsabilidade & Cuidados',
      desc: 'Organização responsável pensando no bem-estar comunitário, garantindo que as entregas sigam todos os protocolos de proteção necessários.',
      icon: Heart,
      color: '#FF2D78',
    },
    {
      step: '04',
      title: 'Distribuição Direta nas Ruas (12/10)',
      desc: 'No Dia das Crianças, o grupo se reúne para distribuir os kits diretamente nas ruas e bairros (como Jardim Aliança e Rochdale em Osasco).',
      icon: Sparkles,
      color: '#FFC300',
    },
  ];

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Header Hero */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white border-b border-gray-100">
        <div className="max-w-[1000px] mx-auto text-center space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-[#FF2D78] bg-[#FFF3EB] px-3.5 py-1 rounded-full border border-[#FF2D78]/30">
            Nossa Iniciativa
          </span>
          <h1 className="font-['Nunito'] text-3xl sm:text-4xl md:text-5xl font-black text-[#0854A7]">
            Conheça o Projeto Social "Meu Pequeno Grande Amigo"
          </h1>
          <p className="text-base md:text-lg text-[#2b2b2b] max-w-2xl mx-auto leading-relaxed">
            Uma bela iniciativa formada por um grupo de amigos unidos por um propósito nobre: entregar doces para crianças carentes no dia 12 de outubro.
          </p>
        </div>
      </section>

      {/* 2. Story Section */}
      <section className="py-14 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-black uppercase tracking-wider text-[#FF2D78]">
              História & Propósito
            </span>
            <h2 className="font-['Nunito'] text-2xl sm:text-3xl font-black text-[#0854A7]">
              Unidos pelo amor e pela alegria das crianças
            </h2>
            <p className="text-base text-[#2b2b2b] leading-relaxed">
              O projeto social <strong>"Meu Pequeno Grande Amigo"</strong> é uma bela iniciativa formada por um grupo de amigos unidos por um propósito nobre: entregar doces para crianças carentes no dia 12 de outubro. Anualmente, esses voluntários realizam a arrecadação das guloseimas por conta própria e se reúnem para fazer a distribuição diretamente nas ruas, o que sempre resulta em um momento muito especial e gratificante para todos os envolvidos.
            </p>
            <p className="text-base text-[#2b2b2b] leading-relaxed">
              Em uma de suas edições marcantes, a ação ocorreu na cidade de Osasco, voltada mais especificamente para as crianças dos bairros Jardim Aliança e Rochdale. Pensando no bem-estar de toda a comunidade, a organização atuou de forma responsável, para que pais e filhos tivessem a garantia de que as entregas seguiriam todos os protocolos de proteção necessários.
            </p>
            <p className="text-base text-[#2b2b2b] leading-relaxed">
              O esforço e a dedicação do grupo se refletiram na qualidade das doações. Os kits entregues às crianças estavam bem recheados e foram preparados com muito carinho, contendo itens deliciosos como bolo, lanche, refrigerante e, claro, bastantes doces para celebrar a data.
            </p>
            <div className="bg-[#FFF3EB] p-5 rounded-2xl border-2 border-[#FFC300] space-y-2">
              <p className="text-sm font-bold italic text-[#111827] leading-relaxed">
                "A apresentação dessa jornada, registrada em vídeo, é encerrada de forma tocante. A criadora do projeto finaliza a gravação muito emocionada, fazendo questão de agradecer primeiramente a Deus. Em seguida, ela estende sua profunda gratidão aos doadores que confiaram na causa, a todos os voluntários envolvidos na linha de frente e às próprias crianças, que são a alma do projeto."
              </p>
              <p className="text-xs font-black text-[#0854A7] uppercase tracking-wider">
                — Encerramento Oficial do Projeto Meu Pequeno Grande Amigo
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-white">
            <img
              src="/galeria/acao-nas-comunidades.jpg"
              alt="Ação nas Comunidades - Meu Pequeno Grande Amigo"
              className="w-full h-[420px] object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const fallback = 'https://i.ibb.co/C3jmLB8k/485870948-671994031879562-923577634615422788-n.jpg';
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6 text-white">
              <div>
                <span className="text-xs font-black text-[#FFC300] uppercase tracking-wider">Ação nas Comunidades</span>
                <p className="text-sm font-bold">Distribuição de afeto, doces e kits recheados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colorful Section Divider */}
      <div className="brand-divider" />

      {/* 3. 4-Step Cycle / How It Works */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#0854A7]">
              Passo a Passo
            </span>
            <h2 className="font-['Nunito'] text-2xl md:text-3xl font-black text-[#0854A7] mt-1">
              Como funciona o ciclo da solidariedade
            </h2>
            <p className="text-sm text-[#2b2b2b] mt-1">
              Transparência, afeto e organização em cada etapa da nossa campanha
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {workflowSteps.map((step) => {
              const IconComp = step.icon;
              return (
                <div
                  key={step.step}
                  className="bg-white border-2 border-gray-100 hover:border-[#1EA8F5] rounded-2xl p-6 relative flex flex-col justify-between transition-all hover:shadow-md group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-white shadow-xs"
                        style={{ backgroundColor: step.color }}
                      >
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-2xl font-black text-gray-200 group-hover:text-[#0854A7] transition-colors">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="font-['Nunito'] text-lg font-black text-[#0854A7]">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2b2b2b] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Photo Gallery */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-[#FFF9F5] border-t border-[#FDD4B8]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF2D78]">
              Galeria de Momentos
            </span>
            <h2 className="font-['Nunito'] text-2xl md:text-3xl font-black text-[#0854A7] mt-1">
              A alegria que suas doações constroem
            </h2>
          </div>

          {/* Category filter buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 'todos', label: 'Todos os Registros' },
              { id: 'brinquedos', label: 'Brinquedos' },
              { id: 'entregas', label: 'Entregas & Festas' },
              { id: 'voluntarios', label: 'Voluntários' },
              { id: 'sorrisos', label: 'Sorrisos' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#0854A7] text-white shadow-xs'
                    : 'bg-white text-[#111827] border border-gray-200 hover:border-[#0854A7]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-64 group cursor-pointer border-2 border-white"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (photo.fallbackUrl && e.currentTarget.src !== photo.fallbackUrl) {
                      e.currentTarget.src = photo.fallbackUrl;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between text-white">
                  <span className="self-end p-2 bg-black/40 rounded-full backdrop-blur-xs">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </span>
                  <div>
                    <span className="text-[11px] text-[#FFC300] font-black uppercase tracking-wider block">
                      {photo.category.toUpperCase()} • {photo.year}
                    </span>
                    <p className="font-bold text-sm text-white drop-shadow-xs">{photo.title}</p>
                    {photo.subtitle && (
                      <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{photo.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="w-full max-h-[70vh] object-contain bg-black"
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (selectedPhoto.fallbackUrl && e.currentTarget.src !== selectedPhoto.fallbackUrl) {
                  e.currentTarget.src = selectedPhoto.fallbackUrl;
                }
              }}
            />
            <div className="p-5 bg-white text-[#111827] flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-t border-gray-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FFF0F5] text-[#FF2D78] uppercase">
                    {selectedPhoto.category}
                  </span>
                  <span className="text-xs text-gray-500">{selectedPhoto.year}</span>
                </div>
                <h4 className="font-bold text-lg font-['Nunito'] text-[#0854A7]">{selectedPhoto.title}</h4>
                {selectedPhoto.description && (
                  <p className="text-sm text-gray-600 max-w-xl">{selectedPhoto.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Bottom CTA Banner */}
      <section className="py-14 px-4 md:px-8 bg-white border-t border-gray-200 text-center">
        <div className="max-w-[700px] mx-auto space-y-4">
          <h3 className="font-['Nunito'] text-2xl md:text-3xl font-black text-[#0854A7]">
            Pronto para transformar vidas neste Dia das Crianças?
          </h3>
          <p className="text-sm md:text-base text-[#2b2b2b]">
            Cada doação e cada gesto de carinho faz a diferença na vida de uma criança.
          </p>
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                onNavigate('doador');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-[#FF2D78] hover:bg-[#e02069] active:scale-95 text-white font-extrabold text-base px-10 py-4 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-5 h-5 fill-white text-white" />
              <span>Quero Ajudar (Seja um Doador)</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
