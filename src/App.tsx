/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DonationPledge, ScreenType } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeScreen } from './components/screens/HomeScreen';
import { ProjectScreen } from './components/screens/ProjectScreen';
import { DonorScreen } from './components/screens/DonorScreen';
import { AdminScreen } from './components/screens/AdminScreen';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Sparkles, X } from 'lucide-react';
import {
  subscribeToPledges,
  savePledgeToFirebase,
  getStoredAdminSession,
  logoutAdmin,
  AdminAuthState,
} from './lib/firebase';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('inicio');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminAuthState | null>(() =>
    getStoredAdminSession()
  );

  // Local storage persisted pledges
  const [pledges, setPledges] = useState<DonationPledge[]>(() => {
    try {
      const saved = localStorage.getItem('mpga_pledges_list');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved pledges', e);
    }
    return [];
  });

  // Real-time synchronization with Firebase Firestore
  useEffect(() => {
    const unsubscribe = subscribeToPledges((remotePledges) => {
      setIsFirebaseSynced(true);
      if (remotePledges && remotePledges.length > 0) {
        setPledges((prev) => {
          const map = new Map<string, DonationPledge>();
          prev.forEach((p) => map.set(p.id, p));
          remotePledges.forEach((p) => map.set(p.id, p));
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mpga_pledges_list', JSON.stringify(pledges));
    } catch (e) {
      console.error('Failed to persist pledges to localStorage', e);
    }
  }, [pledges]);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleAddPledge = async (newPledge: DonationPledge) => {
    // 1. Optimistic local state update
    setPledges((prev) => [newPledge, ...prev]);
    showToast(
      'Cadastro de Doador Realizado!',
      `Obrigado ${newPledge.donorName}! Sua colaboração é muito importante.`
    );

    // 2. Persist to Firebase Firestore
    try {
      await savePledgeToFirebase(newPledge);
    } catch (err) {
      console.warn('Could not persist to Firestore directly:', err);
    }

    // 3. Notify backend API
    try {
      fetch('/api/firebase/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPledge),
      }).catch(() => {});
    } catch {}
  };

  const handleLoginSuccess = (user: AdminAuthState) => {
    setAdminUser(user);
    setCurrentScreen('admin');
    showToast(
      'Sessão de Administrador Ativa',
      `Bem-vindo, ${user.name}! Painel desbloqueado com sucesso.`
    );
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAdminUser(null);
    setCurrentScreen('inicio');
    showToast('Sessão Encerrada', 'Você saiu do painel de administração com segurança.');
  };

  const handleNavigate = (screen: ScreenType) => {
    if (screen === 'admin' && !adminUser) {
      setIsAdminLoginModalOpen(true);
      return;
    }
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1f2937]">
      {/* Top Navbar */}
      <Navbar
        currentScreen={currentScreen}
        isAdminLoggedIn={Boolean(adminUser)}
        onNavigate={handleNavigate}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
      />

      {/* Dynamic Screen View */}
      <main className="flex-grow bg-white">
        {currentScreen === 'inicio' && (
          <HomeScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'projeto' && (
          <ProjectScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'doador' && (
          <DonorScreen
            onAddPledge={handleAddPledge}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'admin' && adminUser && (
          <AdminScreen
            adminUser={adminUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0854A7] text-white p-4 rounded-2xl shadow-xl border-2 border-[#FFC300] flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className="w-9 h-9 rounded-full bg-[#FF2D78] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm font-['Nunito'] text-white">
              {toastMessage.title}
            </h4>
            <p className="text-xs text-white/90 mt-0.5">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
