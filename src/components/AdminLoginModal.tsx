import React, { useState } from 'react';
import {
  loginAdmin,
  AdminAuthState,
} from '../lib/firebase';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  X,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminAuthState) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginAdmin(email, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
        onClose();
      } else {
        setErrorMessage(
          result.error || 'Credenciais inválidas. Verifique o e-mail e a senha.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao autenticar administrador.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-[#0854A7] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0854A7] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-[#FFC300] text-[#0854A7] flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-white">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <span className="bg-[#FF2D78] text-white text-[11px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-xs inline-block mb-1.5">
            Acesso Restrito
          </span>

          <h3 className="font-['Nunito'] font-black text-2xl text-white">
            Login do Administrador
          </h3>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error feedback */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
              E-mail do Administrador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#0854A7] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail do Administrador"
                className="w-full bg-slate-50 border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:bg-white focus:outline-hidden focus:border-[#0854A7] transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#0854A7] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de Acesso"
                className="w-full bg-slate-50 border-2 border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium focus:bg-white focus:outline-hidden focus:border-[#0854A7] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0854A7] hover:bg-[#064283] active:scale-[0.99] text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#FFC300]" />
                  <span>Acessar Painel de Controle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
