import { Campaign, ResponsibleUser, User, Document, Integration, Notification } from './types';
import { 
  authService, 
  profileService, 
  campaignService, 
  teamService, 
  documentService, 
  notificationService, 
  settingsService, 
  integrationService 
} from './lib/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';
import { MOCK_CURRENT_USER, MOCK_RESPONSIBLES } from './constants';

export { MOCK_RESPONSIBLES_MAP } from './constants';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

// Estado local para cache
let localState = {
  campaigns: [] as Campaign[],
  teamMembers: [] as ResponsibleUser[],
  documents: [] as Document[],
  notifications: [] as Notification[],
  settings: { deadlineNotificationEnabled: true },
  integrations: [] as Integration[]
};

let currentUser: User | null = null;
let currentUserId: string | null = null;
let onSyncStatusChange: (status: SyncStatus) => void = () => {};

// Inicialização
export const initializeData = async (
  initialIntegrations: Integration[], 
  syncCallback: (status: SyncStatus) => void
): Promise<{ user: User | null; error: string | null }> => {
  onSyncStatusChange = syncCallback;
  onSyncStatusChange('syncing');

  try {
    // Se Supabase não está configurado, usar modo offline
    if (!isSupabaseConfigured) {
      console.warn('Supabase não configurado - executando em modo offline');
      currentUser = MOCK_CURRENT_USER;
      currentUserId = 'offline-user';
      localState.teamMembers = MOCK_RESPONSIBLES;
      localState.integrations = initialIntegrations;
      onSyncStatusChange('idle');
      return { user: MOCK_CURRENT_USER, error: null };
    }

    // Verificar se há usuário logado
    const user = await authService.getCurrentUser();
    
    if (user) {
      currentUserId = user.id;
      
      // Carregar perfil do usuário
      const profile = await profileService.getProfile(user.id);
      if (profile) {
        currentUser = profile;
        
        // Carregar dados do usuário
        await loadUserData(user.id, initialIntegrations);
        
        // Configurar subscriptions em tempo real
        setupRealtimeSubscriptions(user.id);
        
        onSyncStatusChange('synced');
        return { user: profile, error: null };
      }
    }
    
    currentUser = null;
    currentUserId = null;
    onSyncStatusChange('idle');
    return { user: null, error: null };
    
  } catch (error: any) {
    onSyncStatusChange('error');
    return { user: null, error: error.message || 'Erro ao inicializar dados' };
  }
};

// Carregar dados do usuário
const loadUserData = async (userId: string, initialIntegrations: Integration[]) => {
  try {
    const [campaigns, teamMembers, documents, notifications, settings, integrations] = await Promise.all([
      campaignService.getCampaigns(userId),
      teamService.getTeamMembers(userId),
      documentService.getDocuments(userId),
      notificationService.getNotifications(userId),
      settingsService.getSettings(userId),
      integrationService.getIntegrations(userId)
    ]);

    localState = {
      campaigns,
      teamMembers,
      documents,
      notifications,
      settings,
      integrations: integrations.length > 0 ? integrations : initialIntegrations
    };

    // Se não há integrações, criar as padrão
    if (integrations.length === 0) {
      for (const integration of initialIntegrations) {
        await integrationService.upsertIntegration(integration, userId);
      }
      localState.integrations = initialIntegrations;
    }
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
  }
};

// Configurar subscriptions em tempo real
const setupRealtimeSubscriptions = (userId: string) => {
  if (!isSupabaseConfigured) return;
  
  // Subscription para campanhas
  campaignService.subscribeToCampaigns(userId, (campaigns) => {
    localState.campaigns = campaigns;
  });
};

// Autenticação
export const login = async (email: string, password?: string): Promise<User | null> => {
  try {
    onSyncStatusChange('syncing');
    
    // Se Supabase não está configurado, usar modo offline
    if (!isSupabaseConfigured) {
      console.warn('Supabase não configurado - login offline');
      currentUser = MOCK_CURRENT_USER;
      currentUserId = 'offline-user';
      localState.teamMembers = MOCK_RESPONSIBLES;
      onSyncStatusChange('idle');
      return MOCK_CURRENT_USER;
    }

    // Para compatibilidade com o sistema anterior, se não há senha, fazer signup automático
    let authResult;
    if (password) {
      authResult = await authService.signIn(email, password);
    } else {
      // Tentar login primeiro, se falhar, fazer signup
      authResult = await authService.signIn(email, 'defaultpassword123');
      if (authResult.error) {
        const name = email.split('@')[0];
        authResult = await authService.signUp(email, 'defaultpassword123', name);
        if (authResult.error) {
          throw new Error('Erro ao criar conta');
        }
      }
    }

    if (authResult.error) {
      throw new Error(authResult.error.message);
    }

    if (authResult.data.user) {
      currentUserId = authResult.data.user.id;
      const profile = await profileService.getProfile(authResult.data.user.id);
      
      if (profile) {
        currentUser = profile;
        await loadUserData(authResult.data.user.id, localState.integrations);
        setupRealtimeSubscriptions(authResult.data.user.id);
        onSyncStatusChange('synced');
        return profile;
      }
    }
    
    onSyncStatusChange('error');
    return null;
  } catch (error: any) {
    onSyncStatusChange('error');
    console.error('Erro no login:', error.message);
    return null;
  }
};

export const logout = async () => {
  await authService.signOut();
  currentUser = null;
  currentUserId = null;
  localState = {
    campaigns: [],
    teamMembers: [],
    documents: [],
    notifications: [],
    settings: { deadlineNotificationEnabled: true },
    integrations: []
  };
  onSyncStatusChange('idle');
};

// Getters
export const getCampaigns = (): Campaign[] => localState.campaigns;
export const getTeamMembers = (): ResponsibleUser[] => localState.teamMembers;
export const getUsers = (): User[] => currentUser ? [currentUser] : [];
export const getDocuments = (): Document[] => localState.documents;
export const getSettings = () => localState.settings;
export const getIntegrations = (): Integration[] => localState.integrations;
export const getCurrentUser = (): User | null => currentUser;

// Campanhas
export const addCampaign = async (campaign: Campaign) => {
  if (!currentUserId) return;
  
  try {
    onSyncStatusChange('syncing');
    const newCampaign = await campaignService.createCampaign(campaign, currentUserId);
    localState.campaigns = [newCampaign, ...localState.campaigns];
    onSyncStatusChange('synced');
  } catch (error) {
    onSyncStatusChange('error');
    console.error('Erro ao adicionar campanha:', error);
  }
};

export const updateCampaign = async (updatedCampaign: Campaign) => {
  if (!currentUserId) return;
  
  try {
    onSyncStatusChange('syncing');
    const updated = await campaignService.updateCampaign(updatedCampaign.id, updatedCampaign, currentUserId);
    localState.campaigns = localState.campaigns.map(c => c.id === updated.id ? updated : c);
    onSyncStatusChange('synced');
  } catch (error) {
    onSyncStatusChange('error');
    console.error('Erro ao atualizar campanha:', error);
  }
};

export const deleteCampaign = async (campaignId: string) => {
  if (!currentUserId) return;
  
  try {
    onSyncStatusChange('syncing');
    await campaignService.deleteCampaign(campaignId, currentUserId);
    localState.campaigns = localState.campaigns.filter(c => c.id !== campaignId);
    onSyncStatusChange('synced');
  } catch (error) {
    onSyncStatusChange('error');
    console.error('Erro ao deletar campanha:', error);
  }
};

// Membros da equipe
export const setTeamMembers = (members: ResponsibleUser[]) => {
  localState.teamMembers = members;
};

export const addTeamMember = async (member: ResponsibleUser) => {
  if (!currentUserId) return;
  
  try {
    const newMember = await teamService.addTeamMember(member, currentUserId);
    localState.teamMembers = [...localState.teamMembers, newMember];
  } catch (error) {
    console.error('Erro ao adicionar membro da equipe:', error);
  }
};

// Usuários (compatibilidade)
export const addUser = (user: User) => {
  // No novo sistema, usuários são gerenciados pelo Supabase Auth
  console.log('addUser não implementado no novo sistema');
};

export const updateUser = (updatedUser: Omit<User, 'image'>) => {
  console.log('updateUser não implementado no novo sistema');
};

export const deleteUser = (email: string) => {
  console.log('deleteUser não implementado no novo sistema');
};

export const updateCurrentUser = async (updatedData: Partial<Omit<User, 'email' | 'role'>>): Promise<User | null> => {
  if (!currentUserId || !currentUser) return null;
  
  try {
    await profileService.updateProfile(currentUserId, { ...currentUser, ...updatedData });
    currentUser = { ...currentUser, ...updatedData };
    return currentUser;
  } catch (error) {
    console.error('Erro ao atualizar usuário atual:', error);
    return null;
  }
};

// Documentos
export const setDocuments = (documents: Document[]) => {
  localState.documents = documents;
};

export const addDocument = async (doc: Document) => {
  if (!currentUserId) return;
  
  try {
    const newDoc = await documentService.addDocument(doc, currentUserId);
    localState.documents = [newDoc, ...localState.documents];
  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
  }
};

// Configurações
export const saveSettings = async (settings: { deadlineNotificationEnabled: boolean }) => {
  if (!currentUserId) return;
  
  try {
    await settingsService.updateSettings(currentUserId, settings);
    localState.settings = settings;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
};

// Integrações
export const setIntegrations = async (integrations: Integration[]) => {
  if (!currentUserId) return;
  
  try {
    for (const integration of integrations) {
      await integrationService.upsertIntegration(integration, currentUserId);
    }
    localState.integrations = integrations;
  } catch (error) {
    console.error('Erro ao salvar integrações:', error);
  }
};