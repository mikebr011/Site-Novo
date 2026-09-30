import React, { useState, useEffect } from 'react';
import {
  ContactMessage,
  DonationPledge,
  ChildRegistration,
  RaffleWinner,
  RaffleDraw,
  SubstituteHistoryEntry,
  ScreenType,
} from '../../types';
import {
  subscribeToContacts,
  subscribeToPledges,
  getLatestContacts,
  getLatestPledges,
  subscribeToRegistrations,
  saveRegistrationToFirebase,
  deleteRegistrationFromFirebase,
  saveRaffleDrawToFirebase,
  subscribeToCurrentRaffleDraw,
  ADMIN_EMAIL,
  AdminAuthState,
} from '../../lib/firebase';
import { APP_CONFIG } from '../../data/mockData';
import {
  ShieldCheck,
  Printer,
  Search,
  MessageCircle,
  X,
  FileText,
  User,
  LogOut,
  ArrowLeft,
  QrCode,
  RefreshCw,
  Zap,
  Sparkles,
  Ticket,
  UserX,
  CheckCircle2,
  Trash2,
  Calendar,
  MapPin,
  Send,
  HelpCircle,
  Phone,
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react';

interface AdminScreenProps {
  adminUser: AdminAuthState;
  onLogout: () => void;
  onNavigate: (screen: ScreenType) => void;
}

type AdminTab = 'painel' | 'cadastros' | 'sorteio';

export const AdminScreen: React.FC<AdminScreenProps> = ({
  adminUser,
  onLogout,
  onNavigate,
}) => {
  // 3 ABAS SOLICITADAS: 1. Painel, 2. Cadastros, 3. Sorteio
  const [activeTab, setActiveTab] = useState<AdminTab>('painel');

  // ==========================================
  // ESTADOS DA ABA 1: PAINEL (FALE CONOSCO & PIX)
  // ==========================================
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [pledges, setPledges] = useState<DonationPledge[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(true);
  const [isRefreshingContacts, setIsRefreshingContacts] = useState<boolean>(false);
  const [refreshFeedback, setRefreshFeedback] = useState<boolean>(false);
  const [contactSearchTerm, setContactSearchTerm] = useState<string>('');
  const [activeContactDetail, setActiveContactDetail] = useState<ContactMessage | null>(null);
  const [isPrintContactsModalOpen, setIsPrintContactsModalOpen] = useState<boolean>(false);

  // ==========================================
  // ESTADOS DA ABA 2: CADASTROS (FORMULÁRIO)
  // ==========================================
  const [registrations, setRegistrations] = useState<ChildRegistration[]>([]);
  const [isLoadingRegs, setIsLoadingRegs] = useState<boolean>(true);
  const [regSearchTerm, setRegSearchTerm] = useState<string>('');
  const [guardianName, setGuardianName] = useState<string>('');
  const [childName, setChildName] = useState<string>('');
  const [childBirthDate, setChildBirthDate] = useState<string>('');
  const [cityNeighborhood, setCityNeighborhood] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [referralSource, setReferralSource] = useState<string>('');
  const [isSubmittingReg, setIsSubmittingReg] = useState<boolean>(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // ==========================================
  // ESTADOS DA ABA 3: SORTEIO (20 CREDENCIAIS)
  // ==========================================
  const [currentDraw, setCurrentDraw] = useState<RaffleDraw | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawSuccessNotice, setDrawSuccessNotice] = useState<string | null>(null);
  const [isPrintRaffleModalOpen, setIsPrintRaffleModalOpen] = useState<boolean>(false);
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState<boolean>(false);
  const [selectedAbsentWinnerId, setSelectedAbsentWinnerId] = useState<string>('');
  const [substituteSearchTerm, setSubstituteSearchTerm] = useState<string>('');
  const [substituteNotice, setSubstituteNotice] = useState<string | null>(null);

  // 1. SINCRONIZAÇÃO EM TEMPO REAL FIRESTORE
  useEffect(() => {
    setIsLoadingContacts(true);
    setIsLoadingRegs(true);

    // Contatos Fale Conosco
    const unsubscribeContacts = subscribeToContacts(
      (data) => {
        setContacts(data);
        setIsLoadingContacts(false);
      },
      () => setIsLoadingContacts(false)
    );

    // Doações
    const unsubscribePledges = subscribeToPledges((pledgesList) => {
      setPledges(pledgesList);
    });

    // Cadastros Festa
    const unsubscribeRegs = subscribeToRegistrations((regsData) => {
      setRegistrations(regsData);
      setIsLoadingRegs(false);
    });

    // Sorteio de Credenciais
    const unsubscribeDraw = subscribeToCurrentRaffleDraw((drawData) => {
      setCurrentDraw(drawData);
    });

    return () => {
      if (typeof unsubscribeContacts === 'function') unsubscribeContacts();
      if (typeof unsubscribePledges === 'function') unsubscribePledges();
      if (typeof unsubscribeRegs === 'function') unsubscribeRegs();
      if (typeof unsubscribeDraw === 'function') unsubscribeDraw();
    };
  }, []);

  // 2. Refresh manual na aba Painel (botão de Atualizar ao lado do QR Code)
  const handleManualRefreshContacts = async () => {
    setIsRefreshingContacts(true);
    try {
      const [freshContacts, freshPledges] = await Promise.all([
        getLatestContacts(),
        getLatestPledges(),
      ]);
      if (freshContacts) setContacts(freshContacts);
      if (freshPledges) setPledges(freshPledges);
      setRefreshFeedback(true);
      setTimeout(() => setRefreshFeedback(false), 2500);
    } catch (err) {
      console.warn('Erro ao atualizar contatos e doações:', err);
    } finally {
      setTimeout(() => setIsRefreshingContacts(false), 500);
    }
  };

  // 3. Cálculos de Doações PIX Confirmadas em Tempo Real
  const isConfirmedPixPledge = (p: DonationPledge): boolean => {
    const isConfirmed = p.status === 'confirmado';
    const isPixMethod = p.paymentMethod === 'PIX';
    const isPixId = typeof p.id === 'string' && p.id.startsWith('pix-');
    const isPixMsg =
      typeof p.message === 'string' &&
      (p.message.toLowerCase().includes('pix') ||
        p.message.toLowerCase().includes('qr code') ||
        p.message.toLowerCase().includes('mercado pago'));

    return isConfirmed && (isPixMethod || isPixId || isPixMsg);
  };

  const confirmedPixPledges = pledges.filter(isConfirmedPixPledge);
  const totalPixDonationsCount = confirmedPixPledges.length;
  const totalPixAmount = confirmedPixPledges.reduce(
    (acc, p) => acc + (p.amount || 0),
    0
  );

  const getConfirmedPixCountForContact = (contact: ContactMessage): number => {
    const contactPhoneClean = contact.phone.replace(/\D/g, '');
    const contactNameClean = contact.name.trim().toLowerCase();

    return confirmedPixPledges.filter((p) => {
      const pledgePhoneClean = p.donorPhone.replace(/\D/g, '');
      const pledgeNameClean = p.donorName.trim().toLowerCase();

      const phoneMatch =
        contactPhoneClean.length >= 8 &&
        pledgePhoneClean.length >= 8 &&
        (pledgePhoneClean.includes(contactPhoneClean) ||
          contactPhoneClean.includes(pledgePhoneClean));

      const nameMatch =
        contactNameClean.length > 3 && pledgeNameClean === contactNameClean;

      return phoneMatch || nameMatch;
    }).length;
  };

  // Filtro de contatos Fale Conosco
  const filteredContacts = contacts.filter((c) => {
    const term = contactSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      c.name.toLowerCase().includes(term) || c.phone.toLowerCase().includes(term)
    );
  });

  // 4. Submissão do Formulário de Cadastro (Aba 2: Cadastros)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !guardianName.trim() ||
      !childName.trim() ||
      !childBirthDate.trim() ||
      !cityNeighborhood.trim() ||
      !phone.trim() ||
      !referralSource.trim()
    ) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    setIsSubmittingReg(true);
    setRegSuccessMessage(null);

    const newReg: ChildRegistration = {
      id: `reg-${Date.now()}`,
      guardianName: guardianName.trim(),
      childName: childName.trim(),
      childBirthDate: childBirthDate.trim(),
      cityNeighborhood: cityNeighborhood.trim(),
      phone: phone.trim(),
      referralSource: referralSource.trim(),
      status: 'ativo',
      createdAt: new Date().toISOString(),
    };

    setRegistrations((prev) => [newReg, ...prev]);
    const saved = await saveRegistrationToFirebase(newReg);
    setIsSubmittingReg(false);

    if (saved) {
      setRegSuccessMessage(`Cadastro da criança "${newReg.childName}" registrado com sucesso!`);
      setGuardianName('');
      setChildName('');
      setChildBirthDate('');
      setCityNeighborhood('');
      setPhone('');
      setReferralSource('');
      setTimeout(() => setRegSuccessMessage(null), 4000);
    }
  };

  const handleDeleteRegistration = async (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente remover o cadastro de "${name}"?`)) {
      return;
    }
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
    await deleteRegistrationFromFirebase(id);
  };

  const handleSeedDemoRegistrations = async () => {
    const demoNames = [
      { child: 'Lucas Henrique', guardian: 'Mariana Henrique', birth: '15/04/2017', loc: 'Osasco - Rochdale', tel: '(11) 98111-2233', ref: 'Redes Sociais (Instagram)' },
      { child: 'Beatriz Santos', guardian: 'Carlos Alberto Santos', birth: '22/09/2016', loc: 'Osasco - Jardim Aliança', tel: '(11) 98222-3344', ref: 'Amigos / Familiares' },
      { child: 'Gabriel Oliveira', guardian: 'Fernanda Oliveira', birth: '10/01/2018', loc: 'Osasco - Rochdale', tel: '(11) 98333-4455', ref: 'Voluntários do Projeto' },
      { child: 'Sofia Lima', guardian: 'Juliana Lima', birth: '05/06/2015', loc: 'Osasco - Baronesa', tel: '(11) 98444-5566', ref: 'Cartazes no Bairro' },
      { child: 'Matheus Costa', guardian: 'Rodrigo Costa', birth: '18/11/2016', loc: 'Osasco - Munhoz Jr', tel: '(11) 98555-6677', ref: 'Amigos / Familiares' },
      { child: 'Valentina Silva', guardian: 'Aline Silva', birth: '30/03/2017', loc: 'Osasco - Jardim Aliança', tel: '(11) 98666-7788', ref: 'Redes Sociais' },
      { child: 'Enzo Gabriel', guardian: 'Patricia Gabriel', birth: '12/07/2018', loc: 'Osasco - Iapi', tel: '(11) 98777-8899', ref: 'Voluntários do Projeto' },
      { child: 'Helena Ferreira', guardian: 'Renato Ferreira', birth: '08/02/2016', loc: 'Osasco - Rochdale', tel: '(11) 98888-9900', ref: 'WhatsApp Grupo' },
      { child: 'Davi Lucca', guardian: 'Camila Lucca', birth: '25/08/2017', loc: 'Osasco - Helena Maria', tel: '(11) 98999-0011', ref: 'Amigos' },
      { child: 'Alice Rodrigues', guardian: 'Fabio Rodrigues', birth: '14/12/2015', loc: 'Osasco - Jardim Aliança', tel: '(11) 97111-1212', ref: 'Cartazes' },
      { child: 'Bernardo Martins', guardian: 'Luciana Martins', birth: '03/05/2018', loc: 'Osasco - Bonfim', tel: '(11) 97222-2323', ref: 'Instagram' },
      { child: 'Manuela Souza', guardian: 'Thiago Souza', birth: '19/10/2016', loc: 'Osasco - Rochdale', tel: '(11) 97333-3434', ref: 'Voluntários' },
      { child: 'Samuel Alves', guardian: 'Bruna Alves', birth: '27/04/2017', loc: 'Osasco - Jardim Aliança', tel: '(11) 97444-4545', ref: 'Amigos' },
      { child: 'Laura Mendes', guardian: 'Eduardo Mendes', birth: '09/09/2015', loc: 'Osasco - Aliança', tel: '(11) 97555-5656', ref: 'Redes Sociais' },
      { child: 'Pedro Miguel', guardian: 'Daniela Miguel', birth: '17/01/2018', loc: 'Osasco - Rochdale', tel: '(11) 97666-6767', ref: 'Voluntários' },
      { child: 'Isabella Rocha', guardian: 'Marcelo Rocha', birth: '21/06/2016', loc: 'Osasco - Baronesa', tel: '(11) 97777-7878', ref: 'WhatsApp' },
      { child: 'Joaquim Barbosa', guardian: 'Vanessa Barbosa', birth: '11/03/2017', loc: 'Osasco - Rochdale', tel: '(11) 97888-8989', ref: 'Cartaz' },
      { child: 'Cecília Ramos', guardian: 'Diego Ramos', birth: '04/11/2018', loc: 'Osasco - Aliança', tel: '(11) 97999-9090', ref: 'Amigos' },
      { child: 'Felipe Augusto', guardian: 'Sandra Augusto', birth: '29/08/2015', loc: 'Osasco - Iapi', tel: '(11) 99111-0101', ref: 'Redes Sociais' },
      { child: 'Heloísa Dias', guardian: 'Alexandre Dias', birth: '16/05/2016', loc: 'Osasco - Rochdale', tel: '(11) 99222-1212', ref: 'Voluntários' },
      { child: 'Murilo Ribeiro', guardian: 'Tatiane Ribeiro', birth: '07/07/2017', loc: 'Osasco - Helena Maria', tel: '(11) 99333-2323', ref: 'Amigos' },
    ];

    for (let i = 0; i < demoNames.length; i++) {
      const item = demoNames[i];
      const newReg: ChildRegistration = {
        id: `reg-seed-${Date.now()}-${i}`,
        childName: item.child,
        guardianName: item.guardian,
        childBirthDate: item.birth,
        cityNeighborhood: item.loc,
        phone: item.tel,
        referralSource: item.ref,
        status: 'ativo',
        createdAt: new Date(Date.now() - (demoNames.length - i) * 60000).toISOString(),
      };
      setRegistrations((prev) => [newReg, ...prev]);
      await saveRegistrationToFirebase(newReg);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const term = regSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      r.childName.toLowerCase().includes(term) ||
      r.guardianName.toLowerCase().includes(term) ||
      r.cityNeighborhood.toLowerCase().includes(term) ||
      r.phone.toLowerCase().includes(term)
    );
  });

  // 5. Sorteio de 20 Credenciais (Aba 3: Sorteio)
  // Toda vez que clicar no botão "Iniciar Novo Sorteio (20 Cadastros)", iniciar um Novo Sorteio (20 Cadastros) aleatórios
  const handleStartNewDraw = async () => {
    if (registrations.length === 0) {
      alert('Não há cadastros registrados para realizar o sorteio. Cadastre participantes primeiro.');
      return;
    }

    setIsDrawing(true);
    // Embaralha aleatoriamente todos os cadastrados usando Fisher-Yates
    const pool = [...registrations];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const targetCount = Math.min(20, pool.length);
    const selected = pool.slice(0, targetCount);

    const winners: RaffleWinner[] = selected.map((reg, index) => ({
      credentialNumber: index + 1,
      registrationId: reg.id,
      childName: reg.childName,
      guardianName: reg.guardianName,
      childBirthDate: reg.childBirthDate,
      cityNeighborhood: reg.cityNeighborhood,
      phone: reg.phone,
      referralSource: reg.referralSource,
      status: 'titular',
    }));

    const newDraw: RaffleDraw = {
      id: `draw-${Date.now()}`,
      title: 'Sorteio Oficial de Credenciais - Festa Beneficente 12 de Outubro',
      drawnAt: new Date().toISOString(),
      totalDrawn: winners.length,
      winners,
      history: [],
    };

    setCurrentDraw(newDraw);
    await saveRaffleDrawToFirebase(newDraw);
    setIsDrawing(false);
    setDrawSuccessNotice(`Novo sorteio realizado! 20 credenciais sorteadas aleatoriamente.`);
    setTimeout(() => setDrawSuccessNotice(null), 3500);
  };

  // 6. Sortear Substituto para Participante Ausente
  const handleConfirmSubstitute = async () => {
    if (!currentDraw || !selectedAbsentWinnerId) {
      alert('Selecione o participante ausente que deseja substituir.');
      return;
    }

    const targetWinnerIndex = currentDraw.winners.findIndex(
      (w) => w.registrationId === selectedAbsentWinnerId
    );
    if (targetWinnerIndex === -1) {
      alert('Participante não encontrado no sorteio.');
      return;
    }

    const absentWinner = currentDraw.winners[targetWinnerIndex];
    const alreadyDrawnIds = new Set(
      currentDraw.winners
        .filter((w) => w.status !== 'ausente')
        .map((w) => w.registrationId)
    );
    alreadyDrawnIds.add(absentWinner.registrationId);

    const availablePool = registrations.filter(
      (r) => !alreadyDrawnIds.has(r.id)
    );

    if (availablePool.length === 0) {
      alert('Não há mais cadastros disponíveis no banco para sortear um substituto!');
      return;
    }

    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const substituteCandidate = availablePool[randomIndex];

    const newWinnerSubstitute: RaffleWinner = {
      credentialNumber: absentWinner.credentialNumber,
      registrationId: substituteCandidate.id,
      childName: substituteCandidate.childName,
      guardianName: substituteCandidate.guardianName,
      childBirthDate: substituteCandidate.childBirthDate,
      cityNeighborhood: substituteCandidate.cityNeighborhood,
      phone: substituteCandidate.phone,
      referralSource: substituteCandidate.referralSource,
      status: 'substituto',
      substitutedByName: absentWinner.childName,
      substitutedAt: new Date().toISOString(),
    };

    const historyEntry: SubstituteHistoryEntry = {
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
      credentialNumber: absentWinner.credentialNumber,
      absentRegistrationId: absentWinner.registrationId,
      absentChildName: absentWinner.childName,
      absentGuardianName: absentWinner.guardianName,
      replacementRegistrationId: substituteCandidate.id,
      replacementChildName: substituteCandidate.childName,
      replacementGuardianName: substituteCandidate.guardianName,
    };

    const updatedWinners = [...currentDraw.winners];
    updatedWinners[targetWinnerIndex] = newWinnerSubstitute;

    const updatedDraw: RaffleDraw = {
      ...currentDraw,
      winners: updatedWinners,
      history: [historyEntry, ...(currentDraw.history || [])],
    };

    setCurrentDraw(updatedDraw);
    await saveRaffleDrawToFirebase(updatedDraw);

    setSubstituteNotice(
      `Substituição concluída! O ${absentWinner.credentialNumber}º Lugar (Credencial #${String(absentWinner.credentialNumber).padStart(2, '0')}) agora pertence a "${substituteCandidate.childName}" (Resp: ${substituteCandidate.guardianName}). Participante "${absentWinner.childName}" constou como ausente.`
    );
    setSelectedAbsentWinnerId('');
    setTimeout(() => {
      setIsSubstituteModalOpen(false);
      setSubstituteNotice(null);
    }, 3500);
  };

  const executeBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* ========================================================================= */}
      {/* CABEÇALHO SUPERIOR COM AS 3 ABAS: 1. Painel, 2. Cadastros, 3. Sorteio     */}
      {/* ========================================================================= */}
      <header className="bg-[#0854A7] text-white border-b-2 border-[#FFC300] print:hidden sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Logo / Selo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFC300] text-[#0854A7] flex items-center justify-center font-black shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#0854A7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Nunito'] font-black text-sm sm:text-base text-white leading-tight">
                  Painel de Administração
                </h1>
                <span className="bg-[#FF2D78] text-white text-[9px] font-black uppercase px-2 py-0.2 rounded-full tracking-wider">
                  Oficial
                </span>
              </div>
              <p className="text-[11px] text-blue-100 leading-none mt-0.5">
                {ADMIN_EMAIL}
              </p>
            </div>
          </div>

          {/* AS 3 ABAS SOLICITADAS: 1. Painel, 2. Cadastros, 3. Sorteio */}
          <nav className="flex items-center gap-1.5 bg-[#063f7d] p-1 rounded-xl border border-white/10 self-start md:self-center overflow-x-auto max-w-full">
            {/* Aba 1: Painel */}
            <button
              onClick={() => setActiveTab('painel')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'painel'
                  ? 'bg-[#FFC300] text-black shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>1. Painel</span>
            </button>

            {/* Aba 2: Cadastros */}
            <button
              onClick={() => setActiveTab('cadastros')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'cadastros'
                  ? 'bg-[#FFC300] text-black shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>2. Cadastros ({registrations.length})</span>
            </button>

            {/* Aba 3: Sorteio */}
            <button
              onClick={() => setActiveTab('sorteio')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'sorteio'
                  ? 'bg-[#FFC300] text-black shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>3. Sorteio {currentDraw?.winners?.length ? `(${currentDraw.winners.length}/20)` : ''}</span>
            </button>
          </nav>

          {/* Ações do Topo */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => onNavigate('inicio')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg border border-white/15 transition-all flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Voltar ao Site</span>
            </button>

            <button
              onClick={onLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. ABA 1: PAINEL DE ADMINISTRAÇÃO ANTIGO COM QR CODE, ATUALIZAR E LISTA    */}
      {/* ========================================================================= */}
      {activeTab === 'painel' && (
        <main className="max-w-[1140px] mx-auto px-4 py-5 print:hidden space-y-4">
          
          {/* 1.1 Cards de Métricas: Total Fale Conosco & Doações Feitas com QR Code e Atualizar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Card 1: Total de Fale Conosco */}
            <div className="bg-white px-4 py-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                  Total de Fale Conosco
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-['Nunito'] font-black text-2xl text-[#0854A7]">
                    {contacts.length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    cadastros registrados
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0854A7] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Doações Feitas com Ícone QR Code e Ícone de Atualizar */}
            <div className="bg-white px-4 py-3.5 rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">
                    Doações Feitas (PIX / QR Code)
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Tempo Real
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-['Nunito'] font-black text-2xl text-emerald-600">
                    {totalPixDonationsCount}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold">
                    {totalPixDonationsCount === 1 ? 'doação confirmada' : 'doações confirmadas'}
                  </span>
                  {totalPixAmount > 0 && (
                    <span className="text-xs font-bold text-slate-600">
                      • R$ {totalPixAmount.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
              </div>

              {/* Botão de Atualizar ao lado do ícone QR Code */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleManualRefreshContacts}
                  disabled={isRefreshingContacts}
                  className="w-10 h-10 rounded-lg bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 border border-emerald-200/90 flex items-center justify-center transition-all cursor-pointer shadow-2xs group relative"
                  title="Atualizar lista agora"
                  aria-label="Atualizar lista"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-emerald-700 transition-transform ${
                      isRefreshingContacts ? 'animate-spin' : 'group-hover:rotate-180 duration-500'
                    }`}
                  />
                  {refreshFeedback && (
                    <span className="absolute -bottom-6 right-0 bg-emerald-800 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap animate-in fade-in z-10">
                      ✓ Atualizado
                    </span>
                  )}
                </button>

                {/* Ícone QR Code */}
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* 1.2 Barra de Filtro e Botão "Imprimir Lista Geral" */}
          <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={contactSearchTerm}
                onChange={(e) => setContactSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8.5 pr-8 py-1.5 text-xs font-medium focus:bg-white focus:outline-hidden focus:border-[#0854A7] transition-all"
              />
              {contactSearchTerm && (
                <button
                  onClick={() => setContactSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsPrintContactsModalOpen(true)}
              className="bg-[#0854A7] hover:bg-[#064283] active:scale-95 text-white font-black text-xs px-4 py-2 rounded-lg shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-[#FFC300]" />
              <span>Imprimir Lista Geral</span>
            </button>
          </div>

          {/* 1.3 A Lista Gerada (Tabela Compacta, Limpa e Clara de Contatos) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold bg-slate-50/50">
              <span>Contatos Fale Conosco ({filteredContacts.length})</span>
              <span className="text-emerald-700">
                Doações PIX Confirmadas: <strong>{totalPixDonationsCount}</strong>
              </span>
            </div>

            {isLoadingContacts ? (
              <div className="py-12 text-center space-y-2">
                <RefreshCw className="w-5 h-5 text-[#0854A7] animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Carregando registros em tempo real...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="py-10 text-center space-y-1.5 px-4 text-slate-500">
                <User className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  {contactSearchTerm ? 'Nenhum contato encontrado na busca.' : 'Nenhum contato registrado no momento.'}
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Cadastros enviados pelo formulário Fale Conosco aparecerão automaticamente aqui.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      <th className="py-2 px-3 w-10 text-center">#</th>
                      <th className="py-2 px-3">Seu Nome</th>
                      <th className="py-2 px-3">Número de Telefone / WhatsApp</th>
                      <th className="py-2 px-3 w-32">Data do Envio</th>
                      <th className="py-2 px-3 text-center w-36">Doações Feitas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredContacts.map((contact, idx) => {
                      const cleanPhone = contact.phone.replace(/\D/g, '');
                      const waNumber = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                      const dateFormatted = new Date(contact.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const pixCount = getConfirmedPixCountForContact(contact);

                      return (
                        <tr
                          key={contact.id}
                          onClick={() => setActiveContactDetail(contact)}
                          className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                          }`}
                        >
                          <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-bold text-[#0854A7]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0854A7] font-black text-[10px] flex items-center justify-center shrink-0">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                              <span className="truncate max-w-[220px]">{contact.name}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <a
                              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                                `Olá ${contact.name}! Somos da coordenação do projeto social Meu Pequeno Grande Amigo. Recebemos seu contato no site!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 transition-colors"
                              title="Conversar no WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>{contact.phone}</span>
                            </a>
                          </td>
                          <td className="py-2 px-3 text-[11px] text-slate-500 font-medium">
                            {dateFormatted}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {pixCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                                <span>{pixCount} via PIX</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. ABA 2: CADASTROS (Formulário com os 6 forms + Tabela de Inscritos)       */}
      {/* ========================================================================= */}
      {activeTab === 'cadastros' && (
        <main className="max-w-[1200px] mx-auto px-4 py-6 print:hidden space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-['Nunito'] font-black text-xl sm:text-2xl text-[#0854A7]">
                Formulário de Cadastro & Participantes
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Cadastrados</span>
                <span className="font-['Nunito'] font-black text-2xl text-[#0854A7] leading-none">
                  {registrations.length}
                </span>
              </div>

              {registrations.length === 0 && (
                <button
                  type="button"
                  onClick={handleSeedDemoRegistrations}
                  className="bg-[#FFC300] hover:bg-[#e6b000] text-black font-black text-xs px-3.5 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-xs transition-all"
                  title="Inserir cadastros de exemplo para testar o sorteio"
                >
                  + Carregar Exemplos
                </button>
              )}
            </div>
          </div>

          {regSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{regSuccessMessage}</span>
            </div>
          )}

          {/* O FORMULÁRIO DE CADASTRO OBRIGATÓRIO (Com os 6 campos) */}
          <div className="bg-white rounded-2xl border-2 border-[#0854A7]/20 p-5 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#0854A7] text-white flex items-center justify-center font-bold">
                <Send className="w-4 h-4 text-[#FFC300]" />
              </div>
              <div>
                <h3 className="font-['Nunito'] font-black text-base sm:text-lg text-[#0854A7]">
                  Formulário de Cadastro
                </h3>
                <p className="text-xs text-slate-500">
                  Preencha os campos obrigatórios (*) para registrar a criança e responsável.
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Nome do Responsável * */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1 tracking-wider">
                    1. Nome do Responsável *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maria Aparecida da Silva"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:border-[#0854A7] transition-all"
                    />
                  </div>
                </div>

                {/* 2. Nome da Criança * */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1 tracking-wider">
                    2. Nome da Criança *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#FF2D78] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Lucas Gabriel da Silva"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:border-[#0854A7] transition-all"
                    />
                  </div>
                </div>

                {/* 3. Data de Aniversário da Criança * */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1 tracking-wider">
                    3. Data de Aniversário da Criança *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#0854A7] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: 15/07/2017 ou 15 de Julho"
                      value={childBirthDate}
                      onChange={(e) => setChildBirthDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:border-[#0854A7] transition-all"
                    />
                  </div>
                </div>

                {/* 4. Cidade / Bairro * */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1 tracking-wider">
                    4. Cidade / Bairro *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Osasco - Jardim Aliança"
                      value={cityNeighborhood}
                      onChange={(e) => setCityNeighborhood(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:border-[#0854A7] transition-all"
                    />
                  </div>
                </div>

                {/* 5. Telefone WhatsApp * */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1 tracking-wider">
                    5. Telefone WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:border-[#0854A7] transition-all"
                    />
                  </div>
                </div>

                {/* 6. Como Ficou Sabendo dessa Festa Beneficiente * */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1 tracking-wider">
                    6. Como Ficou Sabendo dessa Festa Beneficiente *
                  </label>
                  <div className="relative">
                    <HelpCircle className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      list="referral-list-options"
                      placeholder="Ex: Redes Sociais, Cartaz no Bairro..."
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:border-[#0854A7] transition-all"
                    />
                    <datalist id="referral-list-options">
                      <option value="Redes Sociais (Instagram / Facebook)" />
                      <option value="Amigos e Familiares" />
                      <option value="Voluntários do Projeto" />
                      <option value="Cartazes espalhados no Bairro" />
                      <option value="Grupo de WhatsApp Comunitário" />
                      <option value="Outro" />
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Botão Enviar Registro */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="bg-[#0854A7] hover:bg-[#064283] active:scale-[0.99] text-white font-black text-xs sm:text-sm px-8 py-3 rounded-xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingReg ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Gravando Registro...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#FFC300]" />
                      <span>Enviar Registro</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Tabela de Cadastros Registrados */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0854A7]" />
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  Lista de Cadastros Registrados ({filteredRegistrations.length})
                </span>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar por nome, bairro ou telefone..."
                  value={regSearchTerm}
                  onChange={(e) => setRegSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-hidden focus:border-[#0854A7]"
                />
              </div>
            </div>

            {isLoadingRegs ? (
              <div className="py-14 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-[#0854A7] animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Carregando cadastros do Firestore...</p>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="py-12 text-center space-y-2 text-slate-500 px-4">
                <User className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-slate-700">Nenhum cadastro encontrado.</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Utilize o formulário acima para registrar crianças e responsáveis.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Nome da Criança</th>
                      <th className="py-2.5 px-3">Aniversário</th>
                      <th className="py-2.5 px-3">Nome do Responsável</th>
                      <th className="py-2.5 px-3">Cidade / Bairro</th>
                      <th className="py-2.5 px-3">Telefone WhatsApp</th>
                      <th className="py-2.5 px-3">Como Ficou Sabendo</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.map((reg, idx) => (
                      <tr
                        key={reg.id}
                        className={`hover:bg-blue-50/40 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0854A7]">
                          {reg.childName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {reg.childBirthDate}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {reg.guardianName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {reg.cityNeighborhood}
                        </td>
                        <td className="py-2.5 px-3">
                          <a
                            href={`https://wa.me/${reg.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{reg.phone}</span>
                          </a>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {reg.referralSource}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRegistration(reg.id, reg.childName)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Excluir cadastro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 3. ABA 3: SORTEIO DE CREDENCIAIS (Controle, 20 Vagas, Substituto, Print)   */}
      {/* ========================================================================= */}
      {activeTab === 'sorteio' && (
        <main className="max-w-[1200px] mx-auto px-4 py-6 print:hidden space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-['Nunito'] font-black text-xl sm:text-2xl text-[#0854A7]">
                Sorteio de 20 Credenciais da Festa Beneficente
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Cadastros Disponíveis</span>
                <span className="font-['Nunito'] font-black text-2xl text-emerald-700 leading-none">
                  {registrations.length}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback de Sorteio Realizado Instantaneamente */}
          {drawSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{drawSuccessNotice}</span>
            </div>
          )}

          {/* PAINEL "CONTROLE DE SORTEIO" */}
          <div className="bg-gradient-to-br from-[#0854A7] to-[#063f7d] text-white rounded-2xl p-5 sm:p-6 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#FFC300]" />
              <h3 className="font-['Nunito'] font-black text-base sm:text-lg text-white">
                Controle de Sorteio
              </h3>
            </div>

            <p className="text-xs text-blue-100 max-w-2xl mb-5 leading-relaxed">
              Inicie um novo sorteio aleatório de 20 credenciais oficiais, substitua participantes ausentes em tempo real, ou imprima a lista oficial timbrada.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {/* Botão 1: Iniciar Novo Sorteio Aleatório de 20 Cadastros */}
              <button
                type="button"
                onClick={handleStartNewDraw}
                disabled={isDrawing || registrations.length === 0}
                className="bg-[#FFC300] hover:bg-[#e6b000] active:scale-95 text-black font-black text-xs sm:text-sm px-5 py-3 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDrawing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Sorteando 20 Cadastros...</span>
                  </>
                ) : (
                  <>
                    <TrophyIcon className="w-4 h-4 text-black" />
                    <span>Iniciar Novo Sorteio (20 Cadastros)</span>
                  </>
                )}
              </button>

              {/* Botão 2: Sortear um Substituto / Ausente */}
              <button
                type="button"
                onClick={() => {
                  if (!currentDraw || !currentDraw.winners?.length) {
                    alert('Faça um sorteio primeiro antes de sortear substitutos.');
                    return;
                  }
                  setIsSubstituteModalOpen(true);
                }}
                disabled={!currentDraw || !currentDraw.winners?.length}
                className="bg-[#FF2D78] hover:bg-[#e02069] active:scale-95 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserX className="w-4 h-4 text-white" />
                <span>Sortear um Substituto / Ausente</span>
              </button>

              {/* Botão 3: Imprimir Lista de Sorteio */}
              <button
                type="button"
                onClick={() => {
                  if (!currentDraw || !currentDraw.winners?.length) {
                    alert('Nenhum sorteio realizado para imprimir.');
                    return;
                  }
                  setIsPrintRaffleModalOpen(true);
                }}
                disabled={!currentDraw || !currentDraw.winners?.length}
                className="bg-white/15 hover:bg-white/25 active:scale-95 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl uppercase tracking-wider transition-all border border-white/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-4 h-4 text-[#FFC300]" />
                <span>Imprimir Lista de Sorteio</span>
              </button>
            </div>
          </div>

          {/* Grid das 20 Credenciais */}
          {currentDraw && currentDraw.winners?.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <h4 className="font-['Nunito'] font-black text-lg text-[#0854A7]">
                    Lista Oficial de Credenciais Sorteadas ({currentDraw.winners.length} de 20)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Sorteio realizado em: {new Date(currentDraw.drawnAt).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                    {currentDraw.winners.filter((w) => w.status === 'substituto').length} vaga(s) com substituto
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {currentDraw.winners.map((winner) => {
                  const isSub = winner.status === 'substituto';
                  return (
                    <div
                      key={`${winner.registrationId}-${winner.credentialNumber}`}
                      className={`p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                        isSub
                          ? 'bg-amber-50/60 border-amber-300'
                          : 'bg-white border-slate-200 hover:border-[#0854A7]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-[#FFC300] text-black font-black text-xs px-2 py-0.5 rounded-md shadow-2xs">
                              {winner.credentialNumber}º Lugar
                            </span>
                            <span className="bg-[#0854A7] text-white font-black text-[10px] px-2 py-0.5 rounded-md font-mono">
                              #{String(winner.credentialNumber).padStart(2, '0')}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isSub
                                ? 'bg-amber-200 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isSub ? 'Substituto' : 'Titular'}
                          </span>
                        </div>

                        <h5 className="font-['Nunito'] font-black text-sm text-[#0854A7] line-clamp-1">
                          {winner.childName}
                        </h5>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Resp: <strong>{winner.guardianName}</strong>
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Nasc: {winner.childBirthDate} • {winner.cityNeighborhood}
                        </p>

                        {isSub && winner.substitutedByName && (
                          <div className="mt-2 text-[10px] bg-amber-100 text-amber-900 p-1.5 rounded border border-amber-200 font-medium">
                            Substituiu: <strong>{winner.substitutedByName}</strong> (Ausente)
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                        <a
                          href={`https://wa.me/${winner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Olá ${winner.guardianName}! A criança ${winner.childName} foi SORTEADA com a Credencial #${String(
                              winner.credentialNumber
                            ).padStart(2, '0')} para a Festa Beneficente de 12 de Outubro do projeto Meu Pequeno Grande Amigo!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAbsentWinnerId(winner.registrationId);
                            setIsSubstituteModalOpen(true);
                          }}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                        >
                          Marcar Ausente
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Histórico de Substitutos */}
              {currentDraw.history && currentDraw.history.length > 0 && (
                <div className="mt-6 bg-slate-100 p-4 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-xs uppercase text-slate-700 mb-2">
                    Histórico de Substitutos por Ausência ({currentDraw.history.length})
                  </h5>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {currentDraw.history.map((h) => (
                      <div key={h.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>
                          <strong>{h.credentialNumber}º Lugar (Credencial #{String(h.credentialNumber).padStart(2, '0')}):</strong> Substituto:{' '}
                          <strong className="text-emerald-700">{h.replacementChildName}</strong> (Resp: {h.replacementGuardianName}){' '}
                          em substituição a <span className="line-through text-rose-600">{h.absentChildName}</span> (Ausente).
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(h.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-['Nunito'] font-black text-lg text-slate-700">
                Nenhum sorteio ativo no momento
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Clique no botão <strong>"Iniciar Novo Sorteio (20 Cadastros)"</strong> no painel de controle acima para sortear as credenciais oficiais.
              </p>
            </div>
          )}
        </main>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETALHE DO CONTATO (FALE CONOSCO)                                  */}
      {/* ========================================================================= */}
      {activeContactDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 print:hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl border border-slate-200">
            <div className="bg-[#0854A7] px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#FFC300]" />
                <h3 className="font-['Nunito'] font-black text-sm">
                  Ficha de Contato
                </h3>
              </div>
              <button
                onClick={() => setActiveContactDetail(null)}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">
                    Seu Nome:
                  </span>
                  <strong className="text-sm text-[#0854A7]">
                    {activeContactDetail.name}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">
                    Telefone / WhatsApp:
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-800">
                      {activeContactDetail.phone}
                    </span>
                    <a
                      href={`https://wa.me/${activeContactDetail.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">
                    Data do Envio:
                  </span>
                  <span className="text-slate-700">
                    {new Date(activeContactDetail.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">
                    Doações Feitas (PIX / QR Code):
                  </span>
                  <div className="mt-0.5">
                    {getConfirmedPixCountForContact(activeContactDetail) > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                        <Zap className="w-3 h-3 fill-emerald-600" />
                        <span>
                          {getConfirmedPixCountForContact(activeContactDetail)} doação(ões) confirmada(s)
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">
                        Nenhuma doação PIX confirmada deste número.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveContactDetail(null)}
                className="w-full bg-[#0854A7] hover:bg-[#064283] text-white font-black text-xs py-2 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: "IMPRIMIR LISTA GERAL" (FALE CONOSCO)                               */}
      {/* ========================================================================= */}
      {isPrintContactsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 print:hidden">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border-2 border-[#0854A7]">
            <div className="bg-[#0854A7] px-4 py-2.5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#FFC300]" />
                <h3 className="font-['Nunito'] font-black text-sm text-white">
                  Pré-visualização: Imprimir Lista Geral (Fale Conosco)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={executeBrowserPrint}
                  className="bg-[#FFC300] hover:bg-[#e6b000] text-black font-black text-xs px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer uppercase tracking-wider shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setIsPrintContactsModalOpen(false)}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <div className="bg-white p-6 max-w-2xl w-full shadow-sm border border-slate-300 rounded-md text-black font-sans space-y-4">
                <div className="border-b border-black pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={APP_CONFIG.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
                    <div>
                      <h2 className="font-bold text-sm text-black uppercase tracking-wide">
                        Meu Pequeno Grande Amigo
                      </h2>
                      <p className="text-[10px] text-gray-700">
                        Campanha Oficial do Dia das Crianças • 12 de Outubro
                      </p>
                      <p className="text-[10px] text-gray-600 font-semibold">
                        Relatório Geral de Contatos e Doações PIX
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-gray-600 space-y-0.5">
                    <div className="font-bold text-black">
                      Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                    </div>
                    <div>Responsável: {ADMIN_EMAIL}</div>
                  </div>
                </div>

                <div className="bg-slate-100 px-3 py-1.5 rounded border border-gray-300 flex items-center justify-between text-[11px] font-bold">
                  <span>Listagem Geral de Contatos</span>
                  <span>{filteredContacts.length} contatos • {totalPixDonationsCount} doações PIX confirmadas</span>
                </div>

                <table className="w-full text-left border-collapse border border-gray-400 text-[11px]">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-400 font-bold uppercase text-[9px]">
                      <th className="p-1.5 border-r border-gray-400 w-8 text-center">#</th>
                      <th className="p-1.5 border-r border-gray-400">Nome do Contato</th>
                      <th className="p-1.5 border-r border-gray-400">Telefone / WhatsApp</th>
                      <th className="p-1.5 border-r border-gray-400 w-28">Data de Envio</th>
                      <th className="p-1.5 text-center w-28">Doações Feitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((c, idx) => {
                      const donPixCount = getConfirmedPixCountForContact(c);
                      return (
                        <tr key={c.id} className="border-b border-gray-300">
                          <td className="p-1.5 border-r border-gray-300 text-center font-bold">{idx + 1}</td>
                          <td className="p-1.5 border-r border-gray-300 font-bold">{c.name}</td>
                          <td className="p-1.5 border-r border-gray-300 font-mono">{c.phone}</td>
                          <td className="p-1.5 border-r border-gray-300 text-[10px]">
                            {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-1.5 text-center font-bold text-[10px]">
                            {donPixCount > 0 ? `${donPixCount} via PIX` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="pt-3 border-t border-gray-300 text-[9px] text-gray-500 flex justify-between items-center">
                  <span>Documento oficial Meu Pequeno Grande Amigo.</span>
                  <span>Fazer o bem sem olhar a quem!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: "SORTEAR UM SUBSTITUTO / AUSENTE"                                  */}
      {/* ========================================================================= */}
      {isSubstituteModalOpen && currentDraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 print:hidden">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border-2 border-rose-500 max-h-[92vh] flex flex-col">
            {/* Header Modal */}
            <div className="bg-rose-600 px-5 py-3.5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <UserX className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-['Nunito'] font-black text-base leading-tight">
                    Sortear um Substituto / Ausente
                  </h3>
                  <span className="text-[11px] text-rose-100 font-medium">
                    {currentDraw.winners.length} participantes sorteados no total
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSubstituteModalOpen(false);
                  setSubstituteSearchTerm('');
                }}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo do Modal com Seleção Visual Prática */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3.5 text-xs">
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Clique diretamente no cartão do participante que <strong>não compareceu / está ausente</strong>.
                Ao confirmar, o sistema registrará a ausência e sorteará automaticamente um novo participante cadastrado para assumir a credencial.
              </p>

              {substituteNotice && (
                <div className="p-3 bg-emerald-50 border-2 border-emerald-400 text-emerald-900 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{substituteNotice}</span>
                </div>
              )}

              {/* Barra de Filtro Rápido */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Localizar por nome da criança, responsável ou credencial..."
                  value={substituteSearchTerm}
                  onChange={(e) => setSubstituteSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8.5 pr-8 py-2 text-xs font-medium focus:bg-white focus:outline-hidden focus:border-rose-500 transition-all"
                />
                {substituteSearchTerm && (
                  <button
                    onClick={() => setSubstituteSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Grid Visual de Cartões dos Participantes Sorteados */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  Selecione o participante ausente:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {currentDraw.winners
                    .filter((w) => {
                      const term = substituteSearchTerm.toLowerCase().trim();
                      if (!term) return true;
                      return (
                        w.childName.toLowerCase().includes(term) ||
                        w.guardianName.toLowerCase().includes(term) ||
                        String(w.credentialNumber).includes(term) ||
                        w.phone.includes(term)
                      );
                    })
                    .map((w) => {
                      const isSelected = selectedAbsentWinnerId === w.registrationId;
                      const isAlreadySub = w.status === 'substituto';

                      return (
                        <div
                          key={w.registrationId}
                          onClick={() => setSelectedAbsentWinnerId(w.registrationId)}
                          className={`p-3 rounded-xl cursor-pointer transition-all border text-left flex flex-col justify-between relative ${
                            isSelected
                              ? 'border-rose-600 bg-rose-50/90 ring-2 ring-rose-500 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-rose-300 hover:bg-slate-50/70'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1">
                                <span className="bg-[#FFC300] text-black font-black text-[10px] px-2 py-0.5 rounded-md">
                                  {w.credentialNumber}º Lugar
                                </span>
                                <span
                                  className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                    isSelected
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-[#0854A7] text-white'
                                  }`}
                                >
                                  #{String(w.credentialNumber).padStart(2, '0')}
                                </span>
                              </div>

                              {isSelected ? (
                                <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                  ✓ Ausente Selecionado
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-slate-500 uppercase">
                                  {isAlreadySub ? 'Substituto' : 'Titular'}
                                </span>
                              )}
                            </div>

                            <h5 className="font-['Nunito'] font-black text-xs sm:text-sm text-slate-900 truncate">
                              {w.childName}
                            </h5>
                            <p className="text-[11px] text-slate-600 truncate mt-0.5">
                              Resp: <strong>{w.guardianName}</strong>
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              Tel: {w.phone} • {w.cityNeighborhood}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Rodapé com Resumo da Seleção e Ações */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="text-xs">
                {selectedAbsentWinnerId ? (
                  <span className="text-rose-800 font-bold">
                    Participante a substituir:{' '}
                    <strong>
                      {currentDraw.winners.find((w) => w.registrationId === selectedAbsentWinnerId)?.childName}
                    </strong>{' '}
                    •{' '}
                    <span className="bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-black">
                      {currentDraw.winners.find((w) => w.registrationId === selectedAbsentWinnerId)?.credentialNumber}º Lugar
                    </span>{' '}
                    (Credencial #
                    {String(
                      currentDraw.winners.find((w) => w.registrationId === selectedAbsentWinnerId)?.credentialNumber
                    ).padStart(2, '0')}
                    )
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium text-[11px]">
                    Nenhum participante selecionado. Clique em um cartão acima.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubstituteModalOpen(false);
                    setSubstituteSearchTerm('');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer text-xs"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSubstitute}
                  disabled={!selectedAbsentWinnerId}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs px-4.5 py-2 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFC300]" />
                  <span>Confirmar & Sortear Substituto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: "IMPRIMIR LISTA DE SORTEIO"                                        */}
      {/* ========================================================================= */}
      {isPrintRaffleModalOpen && currentDraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 print:hidden">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border-2 border-[#0854A7]">
            <div className="bg-[#0854A7] px-4 py-3 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#FFC300]" />
                <h3 className="font-['Nunito'] font-black text-sm text-white">
                  Pré-visualização: Imprimir Lista de Sorteio
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={executeBrowserPrint}
                  className="bg-[#FFC300] hover:bg-[#e6b000] text-black font-black text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Agora</span>
                </button>
                <button
                  onClick={() => setIsPrintRaffleModalOpen(false)}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <div className="bg-white p-6 max-w-3xl w-full shadow-sm border border-slate-300 rounded-md text-black font-sans space-y-4">
                <div className="border-b border-black pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={APP_CONFIG.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
                    <div>
                      <h2 className="font-bold text-base text-black uppercase tracking-wide">
                        Meu Pequeno Grande Amigo
                      </h2>
                      <p className="text-[10px] text-gray-700">
                        Campanha Oficial do Dia das Crianças • 12 de Outubro
                      </p>
                      <p className="text-[10px] font-semibold text-gray-800">
                        Lista Oficial de Credenciais Sorteadas — Festa Beneficente
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-gray-600 space-y-0.5">
                    <div className="font-bold text-black">
                      Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                    </div>
                    <div>Sorteio Realizado: {new Date(currentDraw.drawnAt).toLocaleDateString('pt-BR')}</div>
                    <div>Responsável: {ADMIN_EMAIL}</div>
                  </div>
                </div>

                <div className="bg-slate-100 px-3 py-1.5 rounded border border-gray-300 flex items-center justify-between text-[11px] font-bold">
                  <span>Listagem Oficial das 20 Credenciais</span>
                  <span>Total: {currentDraw.winners.length} participantes sorteados</span>
                </div>

                <table className="w-full text-left border-collapse border border-gray-400 text-[10px]">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-400 font-bold uppercase text-[9px]">
                      <th className="p-1.5 border-r border-gray-400 w-20 text-center">Classificação</th>
                      <th className="p-1.5 border-r border-gray-400 w-16 text-center">Credencial</th>
                      <th className="p-1.5 border-r border-gray-400">Nome da Criança</th>
                      <th className="p-1.5 border-r border-gray-400">Aniversário</th>
                      <th className="p-1.5 border-r border-gray-400">Nome do Responsável</th>
                      <th className="p-1.5 border-r border-gray-400">Cidade / Bairro</th>
                      <th className="p-1.5 text-center w-32">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDraw.winners.map((w) => (
                      <tr key={w.registrationId} className="border-b border-gray-300">
                        <td className="p-1.5 border-r border-gray-300 text-center font-bold">
                          {w.credentialNumber}º Lugar
                        </td>
                        <td className="p-1.5 border-r border-gray-300 text-center font-bold font-mono">
                          #{String(w.credentialNumber).padStart(2, '0')}
                        </td>
                        <td className="p-1.5 border-r border-gray-300 font-bold">{w.childName}</td>
                        <td className="p-1.5 border-r border-gray-300">{w.childBirthDate}</td>
                        <td className="p-1.5 border-r border-gray-300">{w.guardianName}</td>
                        <td className="p-1.5 border-r border-gray-300">{w.cityNeighborhood}</td>
                        <td className="p-1.5 font-mono text-center">{w.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pt-3 border-t border-gray-300 text-[9px] text-gray-500 flex justify-between items-center">
                  <span>Documento oficial de entrega de credenciais da Festa Beneficente Meu Pequeno Grande Amigo.</span>
                  <span>Fazer o bem sem olhar a quem!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMPRESSÃO PURA (@media print)                                             */}
      {/* ========================================================================= */}
      <div className="hidden print:block p-6 bg-white text-black font-sans text-xs">
        {activeTab === 'sorteio' && currentDraw ? (
          <>
            <div className="border-b border-black pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={APP_CONFIG.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
                <div>
                  <h2 className="font-bold text-base uppercase tracking-wide">Meu Pequeno Grande Amigo</h2>
                  <p className="text-[10px] text-gray-800">Campanha Oficial do Dia das Crianças • 12 de Outubro</p>
                  <p className="text-[10px] font-semibold text-gray-700">Lista Oficial de Credenciais Sorteadas — Festa Beneficente</p>
                </div>
              </div>
              <div className="text-right text-[10px] space-y-0.5">
                <div className="font-bold">Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</div>
                <div>Responsável: {ADMIN_EMAIL}</div>
              </div>
            </div>

            <div className="mb-3 text-[10px] font-bold uppercase tracking-wider bg-gray-100 p-1.5 border border-gray-400 flex justify-between">
              <span>Lista Oficial das 20 Credenciais</span>
              <span>Total de Sorteados: {currentDraw.winners.length}</span>
            </div>

            <table className="w-full text-left border-collapse border border-gray-400 text-[9px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400 font-bold uppercase">
                  <th className="p-1 border-r border-gray-400 w-20 text-center">Classificação</th>
                  <th className="p-1 border-r border-gray-400 w-16 text-center">Credencial</th>
                  <th className="p-1 border-r border-gray-400">Nome da Criança</th>
                  <th className="p-1 border-r border-gray-400">Aniversário</th>
                  <th className="p-1 border-r border-gray-400">Nome do Responsável</th>
                  <th className="p-1 border-r border-gray-400">Cidade / Bairro</th>
                  <th className="p-1 text-center w-32">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {currentDraw.winners.map((w) => (
                  <tr key={w.registrationId} className="border-b border-gray-300">
                    <td className="p-1 border-r border-gray-300 text-center font-bold">
                      {w.credentialNumber}º Lugar
                    </td>
                    <td className="p-1 border-r border-gray-300 text-center font-bold font-mono">
                      #{String(w.credentialNumber).padStart(2, '0')}
                    </td>
                    <td className="p-1 border-r border-gray-300 font-bold">{w.childName}</td>
                    <td className="p-1 border-r border-gray-300">{w.childBirthDate}</td>
                    <td className="p-1 border-r border-gray-300">{w.guardianName}</td>
                    <td className="p-1 border-r border-gray-300">{w.cityNeighborhood}</td>
                    <td className="p-1 font-mono text-center">{w.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <div className="border-b border-black pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={APP_CONFIG.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
                <div>
                  <h2 className="font-bold text-base uppercase tracking-wide">Meu Pequeno Grande Amigo</h2>
                  <p className="text-[10px] text-gray-800">Campanha Oficial do Dia das Crianças • 12 de Outubro</p>
                  <p className="text-[10px] font-semibold text-gray-700">Relatório Geral de Contatos e Doações PIX</p>
                </div>
              </div>
              <div className="text-right text-[10px] space-y-0.5">
                <div className="font-bold">Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</div>
                <div>Responsável: {ADMIN_EMAIL}</div>
              </div>
            </div>

            <div className="mb-3 text-[10px] font-bold uppercase tracking-wider bg-gray-100 p-1.5 border border-gray-400 flex justify-between">
              <span>Listagem Geral ({filteredContacts.length} contatos)</span>
              <span>Doações PIX Confirmadas: {totalPixDonationsCount}</span>
            </div>

            <table className="w-full text-left border-collapse border border-gray-400 text-[10px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400 font-bold uppercase text-[9px]">
                  <th className="p-1.5 border-r border-gray-400 w-8 text-center">#</th>
                  <th className="p-1.5 border-r border-gray-400">Nome do Contato</th>
                  <th className="p-1.5 border-r border-gray-400">Telefone / WhatsApp</th>
                  <th className="p-1.5 border-r border-gray-400 w-28">Data de Envio</th>
                  <th className="p-1.5 text-center w-28">Doações Feitas</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((c, idx) => {
                  const donPixCount = getConfirmedPixCountForContact(c);
                  return (
                    <tr key={c.id} className="border-b border-gray-300">
                      <td className="p-1.5 border-r border-gray-300 text-center font-bold">{idx + 1}</td>
                      <td className="p-1.5 border-r border-gray-300 font-bold">{c.name}</td>
                      <td className="p-1.5 border-r border-gray-300 font-mono">{c.phone}</td>
                      <td className="p-1.5 border-r border-gray-300">{new Date(c.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td className="p-1.5 text-center font-bold">{donPixCount > 0 ? `${donPixCount} via PIX` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        <div className="mt-6 pt-3 border-t border-gray-400 text-[9px] flex justify-between items-center text-gray-600">
          <span>Relatório gerado pelo Painel Administrativo Oficial.</span>
          <span>Fazer o bem sem olhar a quem!</span>
        </div>
      </div>
    </div>
  );
};

function TrophyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
