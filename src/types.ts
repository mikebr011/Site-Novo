export type ScreenType = 'inicio' | 'projeto' | 'doador' | 'admin';

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  status?: 'novo' | 'contatado' | 'arquivado';
  notes?: string;
  createdAt: string;
}

export interface ChildRegistration {
  id: string;
  guardianName: string; // 1. Nome do Responsável *
  childName: string; // 2. Nome da Criança *
  childBirthDate: string; // 3. Data de Aniversário da Criança *
  cityNeighborhood: string; // 4. Cidade / Bairro *
  phone: string; // 5. Telefone WhatsApp *
  referralSource: string; // 6. Como Ficou Sabendo dessa Festa Beneficiente *
  status?: 'ativo' | 'sorteado' | 'ausente';
  createdAt: string;
}

export interface RaffleWinner {
  credentialNumber: number; // 1 a 20
  registrationId: string;
  childName: string;
  guardianName: string;
  childBirthDate: string;
  cityNeighborhood: string;
  phone: string;
  referralSource: string;
  status: 'titular' | 'ausente' | 'substituto';
  substitutedById?: string;
  substitutedByName?: string;
  substitutedAt?: string;
  substituteForCredential?: number;
}

export interface SubstituteHistoryEntry {
  id: string;
  timestamp: string;
  credentialNumber: number;
  absentRegistrationId: string;
  absentChildName: string;
  absentGuardianName: string;
  replacementRegistrationId: string;
  replacementChildName: string;
  replacementGuardianName: string;
}

export interface RaffleDraw {
  id: string;
  title: string;
  drawnAt: string;
  totalDrawn: number;
  winners: RaffleWinner[];
  history?: SubstituteHistoryEntry[];
}

export interface Child {
  id: string;
  childName: string;
  age: number;
  gender: 'Menino' | 'Menina' | 'Indiferente';
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  email?: string;
  neighborhood: string;
  password?: string;
  address?: string;
  toyPreference: string;
  wishDetails: string;
  status: 'aguardando' | 'apadrinhado' | 'entregue';
  protocolNumber: string;
  createdAt: string;
  sponsorName?: string;
  sponsorMessage?: string;
}

export interface DonationPledge {
  id: string;
  donorName: string;
  donorEmail?: string;
  donorPhone: string;
  type: 'brinquedos' | 'financeiro' | 'voluntario';
  toyQuantity?: number;
  toyCondition?: 'Novo' | 'Seminovo em ótimo estado';
  dropPointId?: string;
  dropPointName?: string;
  amount?: number;
  paymentMethod?: 'PIX' | 'Cartão' | 'Boleto';
  volunteerRole?: string;
  volunteerAvailability?: string;
  sponsoredChildId?: string;
  sponsoredChildName?: string;
  receiptNumber?: string;
  cpf?: string;
  message?: string;
  status: 'confirmado' | 'entregue';
  createdAt: string;
}

export interface DropPoint {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  hours: string;
  contactPhone: string;
  responsiblePerson: string;
  mapsQuery: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  fallbackUrl?: string;
  filename?: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: 'entregas' | 'brinquedos' | 'voluntarios' | 'sorrisos';
  year: string;
}
