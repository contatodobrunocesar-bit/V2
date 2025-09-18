// FIX: import ExhibitionStatus to be used in mock campaign generation.
import { Campaign, Agency, Responsible, Status, ResponsibleUser, Document, DocumentType, User, UserRole, ExhibitionStatus, MediaPresence, RegiaoFuncional } from './types';

export const MOCK_CURRENT_USER: User = {
    name: 'Bruno César',
    email: 'bruno-silva@secom.rs.gov.br',
    role: UserRole.Admin,
    image: 'https://i.pravatar.cc/150?u=bruno-silva@secom.rs.gov.br',
};

export const MOCK_USERS: User[] = [
  MOCK_CURRENT_USER,
];


export const MOCK_RESPONSIBLES: ResponsibleUser[] = [
    { name: 'Jéssica', image: 'https://i.pravatar.cc/150?u=jessica' },
    { name: 'Bruno', image: 'https://i.pravatar.cc/150?u=bruno' },
    { name: 'Fernanda', image: 'https://i.pravatar.cc/150?u=fernanda' },
    { name: 'Adriana', image: 'https://i.pravatar.cc/150?u=adriana' },
    { name: 'Jamile', image: 'https://i.pravatar.cc/150?u=jamile' },
    { name: 'Natacha', image: 'https://i.pravatar.cc/150?u=natacha' },
];

export const MOCK_RESPONSIBLES_MAP: Record<Responsible, ResponsibleUser> = MOCK_RESPONSIBLES.reduce((acc, user) => {
    acc[user.name] = user;
    return acc;
}, {} as Record<Responsible, ResponsibleUser>);

export const MOCK_CAMPAIGNS: Campaign[] = [];


export const STATUS_COLORS: Record<Status, string> = {
    [Status.Planejamento]: 'bg-blue-500',
    [Status.PendenteAprovacao]: 'bg-yellow-500',
    [Status.EmExecucao]: 'bg-teal-500',
    [Status.AguardandoRelatorio]: 'bg-purple-500',
    [Status.AnaliseInterna]: 'bg-indigo-500',
    [Status.Concluida]: 'bg-green-500',
    [Status.Atrasada]: 'bg-red-500',
    [Status.Cancelada]: 'bg-gray-500',
};

export const AGENCY_COLORS: Record<Agency, string> = {
    [Agency.HOC]: 'border-l-sky-500',
    [Agency.Matriz]: 'border-l-amber-500',
    [Agency.Engenho]: 'border-l-emerald-500',
    [Agency.Centro]: 'border-l-rose-500',
    [Agency.Escala]: 'border-l-violet-500',
};

export const STATUS_ORDER: Status[] = [
    Status.Planejamento,
    Status.PendenteAprovacao,
    Status.EmExecucao,
    Status.AguardandoRelatorio,
    Status.AnaliseInterna,
    Status.Concluida,
    Status.Atrasada,
    Status.Cancelada,
];

export const MOCK_DOCUMENTS: Document[] = [];

export const MAX_FILE_SIZE_MB = 2;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;