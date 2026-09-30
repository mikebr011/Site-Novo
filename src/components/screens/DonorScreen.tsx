import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { DonationPledge, ScreenType } from '../../types';
import { APP_CONFIG } from '../../data/mockData';
import { saveContactToFirebase } from '../../lib/firebase';
import {
  Heart,
  User,
  Phone,
  CheckCircle2,
  Copy,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  QrCode,
  Download,
  Loader2,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Zap,
  X,
  Maximize2,
} from 'lucide-react';

interface DonorScreenProps {
  onAddPledge: (pledge: DonationPledge) => void;
  onNavigate: (screen: ScreenType) => void;
}

interface MpPayment {
  paymentId: number;
  status: string;
  qrCode: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
}

export const DonorScreen: React.FC<DonorScreenProps> = ({
  onAddPledge,
  onNavigate,
}) => {
  // 1. Form state: Nome, Número de Telefone e botão "Pedir para entrar em contato"
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [contactRequested, setContactRequested] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  // 2. PIX donation values: R$ 30, 50 e 100
  const [selectedPixAmount, setSelectedPixAmount] = useState<number>(30);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Mercado Pago states
  const [hasMercadoPago, setHasMercadoPago] = useState<boolean | null>(null);
  const [isQrGenerated, setIsQrGenerated] = useState<boolean>(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState<boolean>(false);
  const [isOpeningCheckout, setIsOpeningCheckout] = useState<boolean>(false);
  const [qrGeneratedFeedback, setQrGeneratedFeedback] = useState<boolean>(false);
  const [mpPayment, setMpPayment] = useState<MpPayment | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    type: 'success' | 'pending' | 'info';
    message: string;
  } | null>(null);
  const [isQrZoomOpen, setIsQrZoomOpen] = useState<boolean>(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const pixOptions = [
    { value: 30, label: 'R$ 30', desc: 'Garante 1 kit com bolo, lanche e doces' },
    { value: 50, label: 'R$ 50', desc: 'Garante kits completos e refrigerantes para as crianças' },
    { value: 100, label: 'R$ 100', desc: 'Apoia vários kits recheados e brinquedos para as ruas' },
  ];

  // Check backend configuration for Mercado Pago Secret
  useEffect(() => {
    fetch('/api/pix/config')
      .then((res) => res.json())
      .then((data) => {
        setHasMercadoPago(Boolean(data.hasMercadoPago));
      })
      .catch((err) => {
        console.warn('Could not check Mercado Pago config:', err);
        setHasMercadoPago(false);
      });
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !donorPhone.trim()) {
      return;
    }

    const contactId = `ct-${Date.now()}`;
    const cleanName = donorName.trim();
    const cleanPhone = donorPhone.trim();

    // Persist directly to Firestore collection "contacts"
    saveContactToFirebase({
      id: contactId,
      name: cleanName,
      phone: cleanPhone,
      status: 'novo',
      notes: 'Solicitou contato através do formulário Fale Conosco',
      createdAt: new Date().toISOString(),
    }).catch((err) => {
      console.warn('Could not save contact to Firestore:', err);
    });

    const newPledge: DonationPledge = {
      id: `pl-${Date.now()}`,
      donorName: cleanName,
      donorPhone: cleanPhone,
      type: 'financeiro',
      message: 'Solicitou que a equipe entre em contato.',
      status: 'confirmado',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddPledge(newPledge);
    setContactRequested({
      name: cleanName,
      phone: cleanPhone,
    });

    setDonorName('');
    setDonorPhone('');
  };

  const [qrCodeUrl, setQrCodeUrl] = useState<string>(APP_CONFIG.pixQrCodeUrl);

  const calculateCrc16 = (payload: string): string => {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xffff;
        } else {
          crc = (crc << 1) & 0xffff;
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  };

  const getPixPayload = (amount?: number) => {
    const key = APP_CONFIG.pixKey;
    const name = 'MEU PEQUENO GRANDE AMIGO';
    const city = 'OSASCO';
    const keyPart = '0014BR.GOV.BCB.PIX01' + key.length.toString().padStart(2, '0') + key;
    const part26 = '26' + keyPart.length.toString().padStart(2, '0') + keyPart;
    const part52 = '52040000';
    const part53 = '5303986';
    let part54 = '';
    if (amount && amount > 0) {
      const amtStr = Number(amount).toFixed(2);
      part54 = '54' + amtStr.length.toString().padStart(2, '0') + amtStr;
    }
    const part58 = '5802BR';
    const cleanName = name.substring(0, 25);
    const part59 = '59' + cleanName.length.toString().padStart(2, '0') + cleanName;
    const cleanCity = city.substring(0, 15);
    const part60 = '60' + cleanCity.length.toString().padStart(2, '0') + cleanCity;
    const part62 = '62070503***';
    const raw = '000201' + part26 + part52 + part53 + part54 + part58 + part59 + part60 + part62 + '6304';
    return raw + calculateCrc16(raw);
  };

  // Generate fallback QR Code locally
  const generateLocalQrCode = (text: string) => {
    QRCode.toDataURL(text, {
      width: 600,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
        setQrCodeUrl(APP_CONFIG.pixQrCodeUrl);
      });
  };

  // Reusable function to generate PIX with attached QR Code image
  const triggerGeneratePix = async (amountToUse: number) => {
    setIsQrGenerated(true);
    setIsCreatingPayment(true);
    setIsApproved(false);
    // Explicitly set QR Code image to the attached image
    setQrCodeUrl('/qrcode.png');
    setQrGeneratedFeedback(true);
    setTimeout(() => setQrGeneratedFeedback(false), 3500);

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    // Smooth scroll to QR code area so the donor immediately sees it
    setTimeout(() => {
      const qrEl = document.getElementById('qr-code-section') || document.getElementById('qr-code');
      if (qrEl) {
        qrEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 150);

    if (hasMercadoPago) {
      try {
        const res = await fetch('/api/pix/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountToUse,
            payerName: donorName || undefined,
            donorPhone: donorPhone || undefined,
          }),
        });
        const data = await res.json();
        if (data.success && data.mode === 'mercadopago') {
          setMpPayment({
            paymentId: data.paymentId,
            status: data.status,
            qrCode: data.qrCode,
            qrCodeBase64: data.qrCodeBase64,
            ticketUrl: data.ticketUrl,
          });
          // Keep the attached official QR code image as requested
          setQrCodeUrl('/qrcode.png');
        } else {
          setMpPayment(null);
          setQrCodeUrl('/qrcode.png');
        }
      } catch (err) {
        console.error('Error in triggerGeneratePix:', err);
        setMpPayment(null);
        setQrCodeUrl('/qrcode.png');
      } finally {
        setIsCreatingPayment(false);
      }
    } else {
      setMpPayment(null);
      setQrCodeUrl('/qrcode.png');
      setIsCreatingPayment(false);
    }
  };

  // Handler to open Mercado Pago checkout or redirect to payment
  const handlePayWithMercadoPago = async () => {
    setIsQrGenerated(true);
    setIsOpeningCheckout(true);
    try {
      // 1. If we already have a ticketUrl from an active MP payment, open it
      if (mpPayment?.ticketUrl) {
        window.open(mpPayment.ticketUrl, '_blank', 'noopener,noreferrer');
        setIsOpeningCheckout(false);
        return;
      }

      // 2. Try creating a preference for Checkout Pro
      const res = await fetch('/api/pix/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPixAmount,
          payerName: donorName || undefined,
        }),
      });
      const data = await res.json();

      if (data.success && (data.initPoint || data.sandboxInitPoint)) {
        const checkoutUrl = data.initPoint || data.sandboxInitPoint;
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Fallback: Copy the PIX code so the user can pay in their bank app
        const codeToCopy = mpPayment?.qrCode || getPixPayload(selectedPixAmount);
        await navigator.clipboard.writeText(codeToCopy);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 4000);
      }
    } catch (err) {
      console.error('Error opening Mercado Pago payment:', err);
      const codeToCopy = mpPayment?.qrCode || getPixPayload(selectedPixAmount);
      await navigator.clipboard.writeText(codeToCopy);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 4000);
    } finally {
      setIsOpeningCheckout(false);
    }
  };

  // Real-time status polling for Mercado Pago payment
  useEffect(() => {
    if (!isQrGenerated || !mpPayment?.paymentId || isApproved) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/pix/status/${mpPayment.paymentId}`);
        const data = await res.json();
        if (data.success && data.isApproved) {
          setIsApproved(true);
          setVerificationFeedback({
            type: 'success',
            message: `Pagamento de R$ ${selectedPixAmount},00 confirmado com sucesso! 🎉 Muito obrigado pelo seu apoio!`,
          });
          onAddPledge({
            id: `pix-mp-${data.paymentId || Date.now()}`,
            donorName: donorName.trim() || 'Doador Anônimo (PIX)',
            donorPhone: donorPhone.trim() || 'PIX Mercado Pago',
            type: 'financeiro',
            amount: selectedPixAmount,
            paymentMethod: 'PIX',
            message: `Doação via PIX Mercado Pago confirmada no valor de R$ ${selectedPixAmount},00.`,
            status: 'confirmado',
            createdAt: new Date().toISOString(),
          });
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      } catch (err) {
        console.error('Polling payment status error:', err);
      }
    }, 3500);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isQrGenerated, mpPayment?.paymentId, isApproved, selectedPixAmount, donorName, donorPhone, onAddPledge]);

  const checkPaymentStatusManual = async () => {
    setIsCheckingStatus(true);
    setVerificationFeedback(null);
    try {
      let approved = false;
      let confirmedId: number | string | undefined = mpPayment?.paymentId;

      // 1. Check direct payment ID if exists
      if (mpPayment?.paymentId) {
        const res = await fetch(`/api/pix/status/${mpPayment.paymentId}`);
        const data = await res.json();
        if (data.success && data.isApproved) {
          approved = true;
          confirmedId = data.paymentId;
        }
      }

      // 2. If not approved yet, search recent approved payments for this amount
      if (!approved) {
        const resRecent = await fetch(`/api/pix/check-recent?amount=${selectedPixAmount}`);
        const dataRecent = await resRecent.json();
        if (dataRecent.success && dataRecent.isApproved) {
          approved = true;
          confirmedId = dataRecent.paymentId;
        }
      }

      if (approved) {
        setIsApproved(true);
        setVerificationFeedback({
          type: 'success',
          message: `Pagamento de R$ ${selectedPixAmount},00 confirmado com sucesso via Mercado Pago! 🎉`,
        });
        onAddPledge({
          id: `pix-mp-${confirmedId || Date.now()}`,
          donorName: donorName.trim() || 'Doador Anônimo (PIX)',
          donorPhone: donorPhone.trim() || 'PIX Mercado Pago',
          type: 'financeiro',
          amount: selectedPixAmount,
          paymentMethod: 'PIX',
          message: `Doação via PIX Mercado Pago confirmada no valor de R$ ${selectedPixAmount},00.`,
          status: 'confirmado',
          createdAt: new Date().toISOString(),
        });
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } else {
        setVerificationFeedback({
          type: 'pending',
          message: `Aguardando confirmação bancária: O Mercado Pago ainda não detectou a compensação deste PIX de R$ ${selectedPixAmount},00. Se você acabou de transferir pelo app do seu banco, aguarde 15 a 30 segundos para o processamento e clique novamente.`,
        });
      }
    } catch (err) {
      console.error('Manual status check error:', err);
      setVerificationFeedback({
        type: 'info',
        message: 'Não foi possível verificar a transação no momento. Caso tenha pago via chave direta, envie o comprovante pelo WhatsApp.',
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(APP_CONFIG.pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleCopyPixCode = () => {
    const textToCopy = mpPayment?.qrCode || getPixPayload(selectedPixAmount);
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Header Hero */}
      <section className="py-10 md:py-14 px-4 md:px-8 bg-white border-b border-gray-100">
        <div className="max-w-[800px] mx-auto text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#FF2D78] bg-[#FFF3EB] px-3.5 py-1 rounded-full border border-[#FF2D78]/30 inline-block">
            Dia das Crianças • 12 de Outubro
          </span>
          <h1 className="font-['Nunito'] text-3xl sm:text-4xl md:text-5xl font-black text-[#0854A7]">
            Seja um Doador
          </h1>
          <p className="text-base md:text-lg text-[#2b2b2b] max-w-xl mx-auto leading-relaxed">
            Sua solidariedade transforma vidas. Peça para entrarmos em contato ou faça um PIX de R$ 30, R$ 50 ou R$ 100 de forma rápida e segura.
          </p>
        </div>
      </section>

      {/* 2. Main Area: Form on one side, PIX options on the other side */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white min-h-[600px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form (Nome, Telefone, Botão "Pedir para entrar em contato") */}
          <div className="lg:col-span-6 bg-white rounded-3xl border-2 border-gray-100 p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#1EA8F5] text-white flex items-center justify-center shadow-xs">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-['Nunito'] font-black text-xl sm:text-2xl text-[#0854A7]">
                  Fale Conosco
                </h3>
                <p className="text-xs text-[#2b2b2b]">
                  Deixe seu número para que a coordenação fale diretamente com você
                </p>
              </div>
            </div>

            {contactRequested ? (
              <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-[#6CC24A]/20 text-[#6CC24A] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-['Nunito'] font-black text-2xl text-[#0854A7]">
                    Pedido de Contato Enviado!
                  </h4>
                  <p className="text-sm text-[#2b2b2b] max-w-sm mx-auto">
                    Obrigado, <strong className="text-[#0854A7]">{contactRequested.name}</strong>! Recebemos seus dados e nossa equipe entrará em contato com muito carinho.
                  </p>
                </div>

                <div className="bg-[#FFF3EB] border-2 border-[#FFC300] p-4 rounded-xl max-w-sm mx-auto text-left text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome registrado:</span>
                    <strong className="text-[#111827]">{contactRequested.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telefone informado:</span>
                    <strong className="text-[#0854A7]">{contactRequested.phone}</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                  <a
                    href={`https://wa.me/${APP_CONFIG.whatsappRaw}?text=${encodeURIComponent(
                      `Olá! Acabei de me cadastrar na página Seja Doador e gostaria de saber como apoiar a campanha do Dia das Crianças Meu Pequeno Grande Amigo.\n\nNome: ${contactRequested.name}\nTelefone: ${contactRequested.phone}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all uppercase tracking-wider"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar no WhatsApp Agora</span>
                  </a>

                  <button
                    onClick={() => setContactRequested(null)}
                    className="border-2 border-[#0854A7] text-[#0854A7] hover:bg-[#0854A7] hover:text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl cursor-pointer transition-all uppercase tracking-wider"
                  >
                    Enviar Outro Contato
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                {/* 1. Nome */}
                <div>
                  <label className="block text-xs font-black text-[#111827] uppercase mb-1.5 tracking-wider">
                    Seu Nome *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#1EA8F5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full bg-white border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-[#111827] font-medium focus:outline-hidden focus:border-[#0854A7] transition-colors"
                    />
                  </div>
                </div>

                {/* 2. Número de Telefone */}
                <div>
                  <label className="block text-xs font-black text-[#111827] uppercase mb-1.5 tracking-wider">
                    Número de Telefone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#6CC24A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="(11) 98765-4321"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="w-full bg-white border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-[#111827] font-medium focus:outline-hidden focus:border-[#0854A7] transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Botão "Pedir para entrar em contato" em Rosa Choque #FF2D78 */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#FF2D78] hover:bg-[#e02069] active:scale-95 text-white font-black py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm sm:text-base uppercase tracking-wider"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span>Pedir para entrar em contato</span>
                  </button>
                </div>

                <div className="bg-[#FFF3EB] border border-[#FFC300]/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#2b2b2b]">
                  <ShieldCheck className="w-4 h-4 text-[#6CC24A] shrink-0 mt-0.5" />
                  <p>
                    Seus dados são confidenciais e utilizados exclusivamente pela coordenação para esclarecer dúvidas e orientar a doação.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Doação Rápida via PIX com Mercado Pago */}
          <div className="lg:col-span-6 bg-white rounded-3xl border-2 border-gray-100 p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF2D78] text-white flex items-center justify-center shadow-xs">
                  <Heart className="w-5 h-5 fill-white text-white" />
                </div>
                <div>
                  <h3 className="font-['Nunito'] font-black text-xl sm:text-2xl text-[#0854A7]">
                    Doação Rápida via PIX
                  </h3>
                  <p className="text-xs text-[#2b2b2b]">
                    Selecione um valor para gerar o QR Code oficial da sua contribuição
                  </p>
                </div>
              </div>

              {/* Status do Mercado Pago */}
              {hasMercadoPago ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#4CAF50] text-[#2E7D32] text-xs font-black tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
                  Mercado Pago Ativo
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PIX Direto Oficial
                </div>
              )}
            </div>

            {/* Banner de Pagamento Confirmado em tempo real */}
            {isApproved && (
              <div className="bg-[#E8F8F0] border-2 border-[#2ECC71] rounded-2xl p-5 text-center space-y-2 animate-in zoom-in-95 shadow-md">
                <div className="w-12 h-12 bg-[#2ECC71] text-white rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-['Nunito'] font-black text-xl text-[#1E7E34]">
                  🎉 Pagamento Confirmado via Mercado Pago!
                </h4>
                <p className="text-sm text-gray-700 max-w-md mx-auto font-medium">
                  Sua doação de <strong>R$ {selectedPixAmount},00</strong> foi processada com sucesso. Em nome de todas as crianças e dos voluntários do <strong>Meu Pequeno Grande Amigo</strong>, nosso mais sincero muito obrigado!
                </p>
              </div>
            )}

            {/* 3 Botões de Seleção de Valor: R$ 30, R$ 50 e R$ 100 */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-xs font-black text-[#111827] uppercase tracking-wider">
                  Escolha o valor da doação:
                </label>
                <span className="text-[11px] font-bold text-[#0854A7] bg-blue-50 px-2 py-0.5 rounded-md">
                  QR Code Oficial Anexado
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {pixOptions.map((opt) => {
                  const isSelected = selectedPixAmount === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedPixAmount(opt.value);
                        if (isQrGenerated) {
                          triggerGeneratePix(opt.value);
                        } else {
                          setIsApproved(false);
                          setVerificationFeedback(null);
                        }
                      }}
                      className={`relative flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0854A7] bg-[#FFF3EB] shadow-md scale-[1.02]'
                          : 'border-gray-200 bg-white hover:border-[#1EA8F5]'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-2.5 right-2 bg-[#FF2D78] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                          Ativo
                        </span>
                      )}
                      <span
                        className={`font-['Nunito'] font-black text-xl sm:text-2xl ${
                          isSelected ? 'text-[#0854A7]' : 'text-[#111827]'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold text-center mt-0.5 line-clamp-1">
                        {opt.value === 30 ? '1 Kit Lanche' : opt.value === 50 ? 'Kits & Bebidas' : 'Super Apoio'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BOTÕES DE AÇÃO: GERAR QR CODE & PAGAMENTO */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Botão 1: Gerar QR Code PIX com a imagem anexada */}
                <button
                  type="button"
                  onClick={() => triggerGeneratePix(selectedPixAmount)}
                  disabled={isCreatingPayment}
                  className="w-full bg-[#0854A7] hover:bg-[#064487] active:scale-[0.99] text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-wider"
                  title={`Gerar QR Code PIX de R$ ${selectedPixAmount},00 com imagem anexada`}
                >
                  {isCreatingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Carregando QR Code...</span>
                    </>
                  ) : (
                    <>
                      {/* Miniatura da imagem do QR Code anexado */}
                      <div className="w-6 h-6 rounded-md bg-white p-0.5 shadow-xs flex items-center justify-center shrink-0 border border-white/40">
                        <img
                          src="/qrcode.png"
                          alt="QR Code PIX"
                          className="w-full h-full object-contain rounded-xs"
                        />
                      </div>
                      <span>
                        {isQrGenerated
                          ? `Atualizar QR Code PIX (R$ ${selectedPixAmount})`
                          : `Gerar QR Code PIX (R$ ${selectedPixAmount})`}
                      </span>
                    </>
                  )}
                </button>

                {/* Botão 2: Pagar com Mercado Pago */}
                <button
                  type="button"
                  onClick={handlePayWithMercadoPago}
                  disabled={isOpeningCheckout}
                  className="w-full bg-[#009EE3] hover:bg-[#0089c7] active:scale-[0.99] text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  title="Efetuar pagamento no Mercado Pago"
                >
                  {isOpeningCheckout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Abrindo Pagamento...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-white" />
                      <span>Pagar com Mercado Pago</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-90" />
                    </>
                  )}
                </button>
              </div>

              {/* Feedback visual de QR Code gerado */}
              {qrGeneratedFeedback && !verificationFeedback && (
                <div className="text-center py-2 px-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-[#0854A7] animate-in fade-in duration-200 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6CC24A]" />
                  <span>
                    QR Code oficial anexado carregado para <strong>R$ {selectedPixAmount},00</strong>!
                  </span>
                </div>
              )}
            </div>

            {/* Quando o QR Code ainda NÃO foi gerado: Card convidativo */}
            {!isQrGenerated ? (
              <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border-2 border-dashed border-[#0854A7]/25 rounded-2xl p-6 sm:p-8 text-center space-y-3.5 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-blue-100 flex items-center justify-center mx-auto p-1.5">
                  <img
                    src="/qrcode.png"
                    alt="QR Code Oficial da Campanha"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="font-['Nunito'] font-black text-xl text-[#111827]">
                    Doação Selecionada: R$ {selectedPixAmount},00
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-1 leading-relaxed">
                    Clique no botão <strong>"Gerar QR Code PIX (R$ {selectedPixAmount})"</strong> acima para exibir o QR Code oficial da sua doação e habilitar o pagamento.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerGeneratePix(selectedPixAmount)}
                  disabled={isCreatingPayment}
                  className="bg-[#0854A7] hover:bg-[#064487] text-white font-black text-xs sm:text-sm py-3 px-6 rounded-xl uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.99]"
                >
                  {isCreatingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Carregando QR Code...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
                        <img src="/qrcode.png" alt="QR Code" className="w-full h-full object-contain" />
                      </div>
                      <span>Gerar QR Code Agora (R$ {selectedPixAmount})</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Área de Detalhes do PIX - Exibida APENAS após gerar o QR Code */
              <div
                id="qr-code-section"
                className="bg-white border-2 border-[#1EA8F5]/30 rounded-2xl p-5 space-y-4 shadow-xs animate-in fade-in zoom-in-98 duration-200"
              >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold block">
                    Valor Selecionado:
                  </span>
                  <span className="font-['Nunito'] font-black text-3xl text-[#0854A7]">
                    R$ {selectedPixAmount},00
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {isCreatingPayment && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#0854A7] font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Atualizando...
                    </span>
                  )}
                  {hasMercadoPago && mpPayment && !isApproved && (
                    <button
                      type="button"
                      onClick={checkPaymentStatusManual}
                      disabled={isCheckingStatus}
                      className="text-xs font-bold text-gray-600 hover:text-[#0854A7] flex items-center gap-1 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      title="Verificar status do pagamento agora"
                    >
                      <RefreshCw className={`w-3 h-3 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                      <span>{isCheckingStatus ? 'Verificando...' : 'Verificar Status'}</span>
                    </button>
                  )}
                  <span className="text-xs font-black bg-[#6CC24A] text-white px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    PIX Oficial da Campanha
                  </span>
                </div>
              </div>

              {/* QR Code e Chave PIX */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div
                  id="qr-code"
                  className="bg-white p-3.5 rounded-2xl border-2 border-[#1EA8F5]/30 shadow-xs shrink-0 text-center w-full sm:w-auto"
                >
                  <div
                    onClick={() => setIsQrZoomOpen(true)}
                    className="bg-white p-2.5 rounded-xl border border-gray-200 flex items-center justify-center min-h-[190px] relative group cursor-pointer hover:border-[#0854A7] transition-colors"
                    title="Clique para ampliar o QR Code"
                  >
                    {isCreatingPayment ? (
                      <div className="w-44 h-44 flex flex-col items-center justify-center gap-2 text-[#0854A7]">
                        <Loader2 className="w-8 h-8 animate-spin text-[#1EA8F5]" />
                        <span className="text-xs font-bold">Carregando QR Code...</span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={qrCodeUrl || '/qrcode.png'}
                          alt={`QR Code PIX - R$ ${selectedPixAmount},00`}
                          className="w-44 h-44 sm:w-48 sm:h-48 rounded-lg mx-auto object-contain transition-transform duration-200 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="bg-[#0854A7] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                            <Maximize2 className="w-3 h-3" />
                            Ampliar
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-[#0854A7] font-black">
                    <QrCode className="w-4 h-4 text-[#0854A7]" />
                    <span>Aponte a câmera do seu banco</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-bold block mt-0.5">
                    Valor: R$ {selectedPixAmount},00
                  </span>
                  
                  <div className="flex flex-col items-center gap-1 mt-2">
                    <a
                      href={qrCodeUrl || '/qrcode.png'}
                      download={`pix-qrcode-meu-pequeno-grande-amigo-R$${selectedPixAmount}.png`}
                      className="inline-flex items-center gap-1 text-[11px] text-[#1EA8F5] hover:text-[#0854A7] font-black underline cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Baixar Imagem QR Code</span>
                    </a>

                    {mpPayment?.ticketUrl && (
                      <a
                        href={mpPayment.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#009EE3] hover:text-[#0854A7] font-black underline cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Abrir Recibo no Mercado Pago</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex-1 w-full space-y-3.5">
                  {/* Mercado Pago payment ID indicator if live */}
                  {mpPayment && (
                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
                      <span className="font-bold">ID Transação Mercado Pago:</span>
                      <span className="font-mono font-bold text-[#0854A7]">#{mpPayment.paymentId}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-black text-[#111827] block mb-1 uppercase tracking-wider">
                      Chave PIX Oficial (E-mail):
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={APP_CONFIG.pixKey}
                        className="bg-white border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-black text-[#0854A7] flex-1 select-all tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={handleCopyPixKey}
                        className="bg-[#0854A7] hover:bg-[#07478d] text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                        title="Copiar Chave PIX"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copiedKey && (
                      <span className="text-[11px] text-[#6CC24A] font-extrabold mt-1 block">
                        ✓ Chave PIX copiada com sucesso!
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* Botão Copiar Código em Amarelo Dourado #FFC300 */}
                    <button
                      type="button"
                      onClick={handleCopyPixCode}
                      className="w-full bg-[#FFC300] hover:bg-[#e6b000] text-black font-black text-xs sm:text-sm py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-xs active:scale-[0.99]"
                    >
                      <Copy className="w-4 h-4 text-black" />
                      <span>{copiedCode ? 'Código Copiado com Sucesso!' : 'Copiar Código Copia e Cola'}</span>
                    </button>

                    {/* Botão para Efetuar Pagamento com Mercado Pago */}
                    <button
                      type="button"
                      onClick={handlePayWithMercadoPago}
                      disabled={isOpeningCheckout}
                      className="w-full bg-[#009EE3] hover:bg-[#0089c7] active:scale-[0.99] text-white font-black text-xs sm:text-sm py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-xs"
                      title="Pagar diretamente com Mercado Pago"
                    >
                      {isOpeningCheckout ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Abrindo Pagamento...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 text-white" />
                          <span>Ir para Pagamento no Mercado Pago</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                        </>
                      )}
                    </button>

                    {/* Botão de Verificação e Confirmação de Pagamento - Aparece APENAS após gerar o QR Code */}
                    <button
                      type="button"
                      onClick={checkPaymentStatusManual}
                      disabled={isCheckingStatus}
                      className={`w-full font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider active:scale-[0.99] ${
                        isApproved
                          ? 'bg-[#2ECC71] text-white shadow-emerald-200'
                          : 'bg-[#059669] hover:bg-[#047857] text-white shadow-emerald-100'
                      }`}
                      title="Consultar e confirmar status do pagamento no Mercado Pago"
                    >
                      {isCheckingStatus ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Verificando Confirmação no Mercado Pago...</span>
                        </>
                      ) : isApproved ? (
                        <>
                          <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                          <span>✓ Pagamento Confirmado com Sucesso!</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4.5 h-4.5 text-white" />
                          <span>Verificar Confirmação do Pagamento</span>
                        </>
                      )}
                    </button>

                    {/* Feedback visual de verificação de pagamento */}
                    {verificationFeedback && (
                      <div
                        className={`p-3.5 rounded-xl text-xs font-bold border transition-all animate-in fade-in flex items-start gap-2.5 ${
                          verificationFeedback.type === 'success'
                            ? 'bg-[#E8F8F0] border-[#2ECC71] text-[#1E7E34]'
                            : verificationFeedback.type === 'pending'
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-blue-50 border-blue-200 text-blue-900'
                        }`}
                      >
                        {verificationFeedback.type === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 text-[#2ECC71] shrink-0 mt-0.5" />
                        ) : verificationFeedback.type === 'pending' ? (
                          <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0 mt-0.5" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 leading-relaxed">
                          {verificationFeedback.message}
                        </div>
                      </div>
                    )}

                    <span className="text-[10px] text-gray-500 font-bold block text-center mt-1">
                      {mpPayment
                        ? `Código PIX Mercado Pago dinâmico para R$ ${selectedPixAmount},00`
                        : `Código PIX Copia e Cola pronto para R$ ${selectedPixAmount},00`}
                    </span>
                  </div>

                  {/* Informação sobre a Secret do Mercado Pago se não configurada */}
                  {!hasMercadoPago && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                      💡 <strong>Mercado Pago:</strong> Adicione seu token na Secret <code>MERCADO_PAGO_ACCESS_TOKEN</code> no painel de Secrets do AI Studio para ativar a confirmação automática de pagamentos via PIX em tempo real. A chave direta oficial acima já está totalmente operacional.
                    </div>
                  )}
                </div>
              </div>

              {/* Botão de Enviar Comprovante */}
              <div className="pt-2 border-t border-gray-100">
                <a
                  href={`https://wa.me/${APP_CONFIG.whatsappRaw}?text=${encodeURIComponent(
                    `Olá! Acabei de fazer uma doação via PIX no valor de R$ ${selectedPixAmount},00 para a campanha do Dia das Crianças Meu Pequeno Grande Amigo!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all uppercase tracking-wider"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Comprovante no WhatsApp</span>
                </a>
              </div>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal para Visualização Ampliada do QR Code Oficial Anexado */}
      {isQrZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsQrZoomOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative animate-in zoom-in-95 border-2 border-[#1EA8F5]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-['Nunito'] font-black text-xl text-[#0854A7]">
                  QR Code PIX
                </h4>
                <p className="text-xs text-gray-500 font-bold">
                  Valor Selecionado: R$ {selectedPixAmount},00
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQrZoomOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-inner flex items-center justify-center">
              <img
                src={qrCodeUrl || '/qrcode.png'}
                alt={`QR Code PIX R$ ${selectedPixAmount},00`}
                className="w-64 h-64 object-contain rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-medium">
                Aponte a câmera do aplicativo do seu banco para o código oficial acima para efetuar sua doação.
              </p>
              <a
                href={qrCodeUrl || '/qrcode.png'}
                download={`pix-qrcode-meu-pequeno-grande-amigo-R$${selectedPixAmount}.png`}
                className="w-full bg-[#0854A7] hover:bg-[#064487] text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all uppercase tracking-wider"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Imagem QR Code</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
